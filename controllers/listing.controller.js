import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ userRef: req.params.id });
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    // Check if user owns this listing
    if (req.user.id !== listing.userRef.toString()) {
      return res.status(401).json({
        success: false,
        message: "You can only delete your own listing",
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Listing Not Found"));
  }
  if (req.user.id !== listing.userRef.toString()) {
    return next(errorHandler("You can Upadate your Own Listings.."));
  }
  try {
    const { userRef, ...updateData } = req.body; // prevent changing userRef
    const updateListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing: updateListing,
    });
    // res.status(200).json(updateListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing Not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }
    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }
     
    let parking = req.query.parking;
    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }
    
    let type = req.query.type;
    if(type===undefined|| type==='all'){
      type = {$in:['sale','rent']};
    }

    const searchTern = req.query.searchTern ||'';

     const sort = req.query.sort || 'createdAt';
    const order = req.query.order||'desc' ;

    const listings = await Listing.find({
      name:{$regex:searchTern,$options:'i'},
      offer,
      furnished,
      parking,
      type,
    }).sort(
      {[sort]:order}).limit(limit).skip(startIndex);
    return res.status(200).json(listings);

  } catch (error) {
    next(error);
  }
};
