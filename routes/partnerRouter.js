const express = require('express');
const Partner = require('../models/partner');
const authenticate = require('../authenticate');
const cors = require('./cors');

const partnerRouter = express.Router();

partnerRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.end('Will send all the partners to you');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Will add the partner: ${req.body.name} 
        with description: ${req.body.description} `);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end('Deleting all partners');
    });

partnerRouter.route('/:partnerId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.end(`Will send details of the partner: ${req.params.partnerId} to you`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.write(`Updating the partner: ${req.params.partnerId}\n`);
        res.end(`Will update the partner: ${req.body.name} 
        with description: ${req.body.description}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Deleting partner: ${req.params.partnerId}`);
    });

module.exports = partnerRouter;