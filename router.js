const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const formidable = require('express-formidable');
const fs = require('fs');
const jimp = require('jimp');
//const sharp = require('sharp');
//const image = require('images');
//const image = require('images');
const CommentRoutes = express.Router();
CommentRoutes.use(formidable({
    maxFileSize: 5 * 1024 * 1024,
    maxTotalFileSize: 5 * 1024 * 1024,
    encoding: 'utf-8',
    uploadDir: path.join(__dirname, 'public', 'upload'),
    multiples: true,
    keepExtensions: true
}));
// const PNG = require("pngjs").PNG;
// https://github.com/oliver-moran/jimp#image-manipulation-methods-default-plugins
const resizeThumb = async (image, object) => {
    const payload = await jimp.read(image);
    payload.resize(100, jimp.AUTO);
    await payload.writeAsync(`${path.join(object.dir, object.name + `.png`)}`);
    return true;
};
CommentRoutes.post('/', async function (req, res) {
    
    if (req.fields?.title && req.fields?.message) {
        //has title and message
        if (req.files?.image?.size !== 0 && req.files?.image?.name !== '') {
            //has file image
            const imageFile = path.parse(req.files.image.path);
            //const finalExt = (req.files.image.type === '.gif') ? '.gif' : '.png';
            const finalExt = (req.files.image.type === 'image/gif') ? '.gif' : '.png';
            const loadPath = `${path.join(imageFile.dir, imageFile.base)}`;
            const finalPath = `${path.join(imageFile.dir, imageFile.name+`${finalExt}`)}`;
            console.log('file=> size: ', req.files.image.size, ' path: ', req.files.image.path, ' name: ', req.files.image.name, ' type: ', req.files.image.type, ' hash: ', req.files.image.hash, ' modAt: ', req.files.image.lastModifiedDate);
            console.log('------------------------------')
            console.log('fields=>', req.fields)
            console.log('------------------------------')
            console.log('image=> root: ', imageFile.root, ' dir: ', imageFile.dir, ' base: ', imageFile.base, ' ext: ', imageFile.ext, ' name: ', imageFile.name);
            console.log('------------------------------')
            let testlength = `${req.files.image.type.length}`
            console.log(testlength.length, typeof(testlength), typeof(req.files.image.type), testlength, req.files.image.type)
            console.log('------------------------------')
            console.assert(req.files.image.type === 'image/gif','image not ===image/gif');
            console.assert(req.files.image.type == 'image/gif','image not ==image/gif');
            console.assert(req.files.image.type === '.gif','image not .gif', req.files.image.type);
            console.assert(req.files.image.type === '.jpg','image not .jpg', req.files.image.type);
            console.assert(req.files.image.type === '.png','image not .png', req.files.image.type);
            console.log('------------------------------')
            console.log(loadPath, ' ', finalPath, ' ', finalExt, req.files.image.type)
            try {
                await jimp.read(loadPath)
                    .then(image => {
                        return image
                            .resize(100, jimp.AUTO)
                            .quality(80)
                            .writeAsync(finalPath)
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
                                    .resize(100, jimp.AUTO)
                                    .quality(80)
                                    .writeAsync(finalPath)
                            })
                            .catch(err => {
                                throw err;
                            })
                    } catch (err) {
                        if (err) throw err
                    }
                }
            }
            
            fs.unlink(req.files.image.path, (err) => {
                if (err) throw err;
            })
            res.render('home/home', { received: { title: req.fields?.title, message: req.fields?.message }, imagez: `/upload/${imageFile.name}${finalExt}` })
        }
        else {
            //error no image
            res.render('home/home', { received: { title: req.fields?.title, message: req.fields?.message }, imagez: 'empty.png' })
        }
    }
    else {
        //error title/message
        res.render('home/home', { received: { title: 'no title', message: 'no message' }, image: 'empty.png' })
    }
});
module.exports = { "CommentRoutes": CommentRoutes };