const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // We'll use our auth middleware to protect the route

// Item Model
const Item = require('../../models/Item');

// @route   GET api/items
// @desc    Get All Items
// @access  Public
router.get('/', (req, res) => {
  Item.find()
    .sort({ dateListed: -1 })
    .then(items => res.json(items));
});

// @route   POST api/items
// @desc    Create An Item
// @access  Private
router.post('/', auth, (req, res) => {
  const newItem = new Item({
    owner: req.user.id,
    name: req.body.name,
    description: req.body.description,
    dailyRate: req.body.dailyRate,
    imageUrl: req.body.imageUrl
  });

  newItem.save().then(item => res.json(item));
});

// @route   GET api/items/:id
// @desc    Get A Single Item
// @access  Public
router.get('/:id', (req, res) => {
    Item.findById(req.params.id)
        .then(item => {
            if (!item) {
                return res.status(404).json({ msg: 'Item not found' });
            }
            res.json(item);
        })
        .catch(err => res.status(404).json({ msg: 'Item not found' }));
});


module.exports = router;