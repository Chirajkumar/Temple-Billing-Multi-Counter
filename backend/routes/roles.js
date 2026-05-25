const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { protect, authorize } = require('../middleware/auth');

// Helper function to normalize role name to proper enum value
const normalizeRoleName = (name) => {
  if (!name) return name;
  // Capitalize first letter of each word
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// GET all roles
router.get('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single role
router.get('/:id', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create role
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    let { name, permissions, description } = req.body;

    // Normalize role name
    name = normalizeRoleName(name);

    // Check if role already exists (case-insensitive)
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = new Role({
      name,
      permissions,
      description
    });

    await role.save();
    res.status(201).json({ 
      message: 'Role created successfully', 
      role 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update role
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    let { name, permissions, description, active } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Normalize role name if provided
    if (name) {
      name = normalizeRoleName(name);
      
      // Check if new name already exists (and it's not the same role)
      if (name !== role.name) {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
          return res.status(400).json({ message: 'Role name already exists' });
        }
        role.name = name;
      }
    }

    if (permissions) role.permissions = permissions;
    if (description !== undefined) role.description = description;
    if (active !== undefined) role.active = active;

    await role.save();
    res.json({ 
      message: 'Role updated successfully', 
      role 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE role
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
