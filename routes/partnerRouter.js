
const express = require("express");
const Partner = require("../models/partner");
const authenticate = require('../authenticate');
const { verifyUser, verifyAdmin } = require('../authenticate')


const partnerRouter = express.Router();


partnerRouter.route('/')
    .get(async (req, res, next) => {
        try {
            const partners = await Partner.find()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        }
        catch (err) {
            next(err);
        }
    })

    //authenticate all except the.get
    .post(verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const partner = await Partner.create(req.body)
            console.log('Partner Created ', partner);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        }
        catch (err) { next(err); }
    })
    .put(verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const response = await Partner.deleteMany()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        }
        catch (err) { next(err); }
    })

partnerRouter.route('/:partnerId')
    .get(async (req, res, next) => {
        try {
            const partner = await Partner.findById(req.params.partnerId)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        }
        catch (err) { next(err); }
    })
    .post(verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const partner = await Partner.findByIdAndUpdate(req.params.partnerId, { $set: req.body }, { new: true })
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        }
        catch (err) { next(err); }
    })
    .delete(verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const response = await Partner.findByIdAndDelete(req.params.partnerId)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        }
        catch (err) {
            next(err);
        }
    })


module.exports = partnerRouter;