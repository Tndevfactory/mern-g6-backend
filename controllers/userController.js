const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const StockMovement = require("../models/stockMovementModel");
const bcrypt = require("bcryptjs");

const uploadPath = path.join(__dirname, "..", "public/uploads/");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

const createUser = asyncHandler(async (req, res) => {
  const file = req.files.file;
  const fileName = new Date().getTime() + "_" + file.name;
  const imageUrl = "uploads/" + fileName;

  file.mv(uploadPath + fileName, function (err) {
    if (err) return res.status(500).send(err);
  });

  // create random password
  const randomPassword =
    new Date().getTime() + Math.random().toString(36).slice(-8);

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  // creation
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    adresse: req.body.adresse,
    password: hashedPassword,
    imgUrl: imageUrl,
  });

  // send mail to user with randomPassword

  res.status(200).json({ randomPassword });
});

const updateUser = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const PreviousQuantity = product.stockQuantity;
  const delta = PreviousQuantity - req.body.stockQuantity;

  const productModified = await Product.findByIdAndUpdate(
    req.params.id,
    {
      designation: req.body.designation,
      description: req.body.description,
      prix: req.body.prix,
      stockQuantity: req.body.stockQuantity,
      imgUrl: req.body.imageUrl,
    },
    {
      new: true,
    }
  );

  const stockMovement = await StockMovement.create({
    sens: "out",
    quantity: delta,
    productId: product._id,
    createdBy: req.body.userId,
    comment: "Retour de Stock defectueux",
  });

  res.status(200).json({ product, stockMovement });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ user, message: "deletion with success" });
});

module.exports = { getUsers, createUser, updateUser, deleteUser };
