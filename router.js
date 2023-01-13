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
    console.log('file=> size: ', req.files.image.size, ' path: ', req.files.image.path, ' name: ', req.files.image.name, ' type: ', req.files.image.type, ' hash: ', req.files.image.hash, ' modAt: ', req.files.image.lastModifiedDate);
    console.log('fields=>', req.fields)
    if (req.fields?.title && req.fields?.message) {
        //has title and message
        if (req.files?.image?.size !== 0 && req.files?.image?.name !== '') {
            console.log('if image')
            //has file image
            const imageFile = path.parse(req.files.image.path);
            console.log(imageFile)
            console.log('image=> root: ', imageFile.root, ' dir: ', imageFile.dir, ' base: ', imageFile.base, ' ext: ', imageFile.ext, ' name: ', imageFile.name);
            const loadPath = `${path.join(imageFile.dir, imageFile.base)}`;
            const finalPath = `${path.join(imageFile.dir, imageFile.name+'.png')}`;
            console.log(loadPath, ' ', finalPath, typeof(loadPath), typeof(finalPath))
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
                /*const transform = await resizeThumb(finalPath,imageFile);
                switch (transform) {
                    case true:
                        console.log('ok');
                        break;
                    case false:
                        console.log('nay');*/
                /*await jimp.read(imageFile)
                    .then(image=> {
                        return image
                        .resize(100,jimp.AUTO)
                        .quality(80)
                        .writeAsync(finalPath)
                    })
                    .catch(err=> {
                        throw err;
                    })*/
                /*images(imageFile)
                .size(100)
                .encode("jpg")
                .save(finalPath, { quality: 80})*/
                /*sharp(req.files.image.path)
                .resize({
                    fit: sharp.fit.contain,
                    width: 100,
                })
                .toFormat('jpg')*/
                //.png({ palette: true })
                //.toFile(finalPath)
            } catch (err) {
                if (err) {
                    console.log(err)
                    try {
                        await jimp.read(loadPath)
                            .then(image => {
                                return image
                                    .resize(100, jimp.AUTO)
                                    .quality(80)
                                    .writeAsync()
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
            console.log(req.files.image.filepath, req.files.image.mimetype, req.files.image.hash);
            console.log(req.files.image.name, req.files.image.size);
            res.render('home/home', { received: { title: req.fields?.title, message: req.fields?.message }, image: `/upload/${req.files.image.name}` })
        }
        else {
            //error no image
            res.render('home/home', { received: { title: req.fields?.title, message: req.fields?.message }, image: 'empty.png' })
        }
    }
    else {
        //error title/message
        res.render('home/home', { received: { title: 'no title', message: 'no message' }, image: 'empty.png' })
    }
});
module.exports = { "CommentRoutes": CommentRoutes };