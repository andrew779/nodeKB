const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/article');

// User Model
let User = require('../models/user');

router.get('/add', ensureAuthenticated, (req,res) => {
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add submit POST Route
router.post('/add', function(req, res){
    req.checkBody('title','Title is required').notEmpty();
    // req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();
    // Get Errors
    req.getValidationResult().then(function(result){
        console.log("The result is:  " + result.array());
        if(!result.isEmpty()){
            res.render('add_article',{
            title:"Add Article",
            errors: result.array()
            });
            return;
        } else {
            let article = new Article();
            article.title = req.body.title;
            article.author = req.user._id;
            article.body = req.body.body;

            article.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }
                req.flash('success', 'Article Added');
                res.redirect('/');
            }); 
        }
    });
});

// Update submit POST Route
router.post('/edit/:id', ensureAuthenticated, function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}
    Article.update(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }
        req.flash('success', 'Article Updated');
        res.redirect('/');
    });
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
        title: 'Edit',
        article: article
        });
    });
});


router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(401).send();
    }

    let query = {_id: req.params.id};
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(401).send();
        } else {
            Article.remove(query, function(error){
                if(error){
                    console.log(error);
                    return;
                }
            res.send('Success');
            });
        }
    });

});

// Get Single Article
router.get('/:id', function(req, res){
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function(err, user){
            res.render('article', {
                article: article,
                author: user.name
            });
        });
        
    });
});

// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;