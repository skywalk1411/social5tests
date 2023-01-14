const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const formidable = require('express-formidable');
const fs = require('fs');
const jimp = require('jimp');
const HomeRoutes = express.Router();
const pathToPublic = path.join(__dirname,'public');
const pathToThumb = path.join(__dirname,'public','thumbnails');
const pathToFsize = path.join(__dirname,'public','fullsizes');
HomeRoutes.use(formidable({
    maxFileSize: 5 * 1024 * 1024,
    maxTotalFileSize: 5 * 1024 * 1024,
    encoding: 'utf-8',
    uploadDir: path.join(pathToPublic, 'upload'),
    multiples: true,
    keepExtensions: true
}));
const settings = {
    defaultExtIfGif: '.png',
    defaultExtIfElse: '.png',
    defaultQuality: 80,
    defaultThumbnailResizeWidth: 100,
    defaultFullsizeResizeWidth: 600,

}
HomeRoutes.post('/', async function (req, res) {
    if (req.fields?.title && req.fields?.message) {
        if (req.files?.image?.size !== 0 && req.files?.image?.name !== '') {
            const imageFile = path.parse(req.files.image.path);
            const finalExt = (imageFile.ext === '.gif') ? settings.defaultExtIfGif : settings.defaultExtIfElse;
            const loadPath = `${path.join(imageFile.dir, imageFile.base)}`;
            const thumbPath = `${path.join(pathToThumb, imageFile.name.replace('upload_','')+finalExt)}`;
            const fsizePath = `${path.join(pathToFsize, imageFile.name.replace('upload_','')+finalExt)}`;
            let sizes = {
                original: {
                    width: null,
                    height: null,
                },
                
            };
            try {
                await jimp.read(loadPath)
                    .then(image => {
                        sizes.original.width = image.bitmap.width;
                        sizes.original.height = image.bitmap.height;
                        return image
                            .resize(settings.defaultThumbnailResizeWidth, jimp.AUTO)
                            .quality(settings.defaultQuality)
                            .writeAsync(thumbPath)
                    })
                    .catch(err => {
                        throw err;
                    })
            } catch (err) {
                if (err) {
                    console.log(err)
                    try {
                        await jimp.read(loadPath)
                            .then(image => {
                                sizes.original.width = image.bitmap.width;
                                sizes.original.height = image.bitmap.height;
                                return image
                                    .resize(settings.defaultThumbnailResizeWidth, jimp.AUTO)
                                    .quality(settings.defaultQuality)
                                    .writeAsync(thumbPath)
                            })
                            .catch(err => {
                                throw err;
                            })
                    } catch (err) {
                        if (err) throw err
                    }
                }
            }
            try {
                await jimp.read(loadPath)
                    .then(image => {
                        return image
                            .resize(settings.defaultFullsizeResizeWidth, jimp.AUTO)
                            .quality(settings.defaultQuality)
                            .writeAsync(fsizePath)
                    })
                    .catch(err => {
                        throw err;
                    })
            } catch (err) {
                if (err) {
                    console.log(err)
                    try {
                        await jimp.read(loadPath)
                            .then(image => {
                                return image
                                    .resize(settings.defaultFullsizeResizeWidth, jimp.AUTO)
                                    .quality(settings.defaultQuality)
                                    .writeAsync(fsizePath)
                            })
                            .catch(err => {
                                throw err;
                            })
                    } catch (err) {
                        if (err) throw err
                    }
                }
            }
            try {fs.unlink(req.files.image.path, (err) => {
                if (err) throw err;
            }) } catch (err) {
                if (err) throw err;
            }
            res.render('home/home', { fields: { title: req.fields?.title, message: req.fields?.message }, thumbnail: `/thumbnails/${imageFile.name.replace('upload_','')}${finalExt}`, fullsize: `/fullsizes/${imageFile.name.replace('upload_','')}${finalExt}`, stats: { original: {size: req.files.image.size, path: req.files.image.path, name: req.files.image.name, type: req.files.image.type, hash: req.files.image.hash, hash2: imageFile.name.replace('upload_',''), modAt: req.files.image.lastModifiedDate, width: sizes.original.width, height: sizes.original.height }} })
        }
        else {
            //error no image
            res.render('home/home', { fields: { title: req.fields?.title, message: req.fields?.message }, thumbnail: 'empty.png', fullsize: 'logo.png', stats: null})
        }
    }
    else {
        //error title/message
        res.render('home/home', { fields: { title: 'no title', message: 'no message' }, thumbnail: 'empty.png', fullsize: 'logo.png', stats: null})
    }
});
module.exports = { "HomeRoutes": HomeRoutes };