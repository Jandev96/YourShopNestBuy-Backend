import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";

// Add Review
export const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: "Rating and comment are required" });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Prevent duplicate review by same user
        const alreadyReviewed = await Review.findOne({
            userId: req.user.id,
            productId,
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Create review
        const review = await Review.create({
            userId: req.user.id,
            productId,
            rating,
            comment
        });

        // Recalculate average rating and numReviews
        const reviews = await Review.find({ productId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        product.rating = avgRating;
        product.numReviews = reviews.length;
        await product.save();

        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Reviews for a Product
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .populate("userId", "username");

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }

        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a Review (User or Admin)
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Allow only review owner or admin to delete
        if (review.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        const productId = review.productId;

        await review.deleteOne();

        // Recalculate product rating after deletion
        const reviews = await Review.find({ productId });
        if (reviews.length) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            await Product.findByIdAndUpdate(productId, {
                rating: avgRating,
                numReviews: reviews.length,
            });
        } else {
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                numReviews: 0,
            });
        }

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }


};

export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const reviewId = req.params.reviewId;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Only the user who created the review can update it
        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this review" });
        }

        // Update rating/comment if provided
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        // Recalculate average rating for the product
        const reviews = await Review.find({ productId: review.productId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await Product.findByIdAndUpdate(review.productId, {
            rating: avgRating,
            numReviews: reviews.length,
        });

        res.json({ message: "Review updated successfully", review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};