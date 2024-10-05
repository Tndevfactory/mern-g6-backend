const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const Product = require("../models/productModel");
const StockMovement = require("../models/stockMovementModel");

const uploadPath = path.join(__dirname, "..", "public/uploads/");

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
});

const createProduct = asyncHandler(async (req, res) => {
  const file = req.files.file;
  const fileName = new Date().getTime() + "_" + file.name;
  const imageUrl = "uploads/" + fileName;

  file.mv(uploadPath + fileName, function (err) {
    if (err) return res.status(500).send(err);
  });

  const product = await Product.create({
    designation: req.body.designation,
    description: req.body.description,
    prix: req.body.prix,
    stockQuantity: req.body.stockQuantity,
    imgUrl: imageUrl,
  });

  const stockMovement = await StockMovement.create({
    sens: "in",
    quantity: product.stockQuantity,
    productId: product._id,
    createdBy: req.body.userId,
    comment: "Nouvelle Alimentation de Stock",
  });
  res.status(200).json({ product, stockMovement });
});

const updateProduct = asyncHandler(async (req, res) => {
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

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  res.json(product);
});

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
