const { model } = require("mongoose");
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

exports.homepage = async(req,res)=>{
    try{
        const limitNumber = 5;
        const categories = await Category.find().limit(limitNumber);
        const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
        const thai = await Recipe.find({category: 'Thai'}).limit(limitNumber);
        const american = await Recipe.find({category: 'American'}).limit(limitNumber);
        const chinese = await Recipe.find({category: 'Chinese'}).limit(limitNumber);
        const food = {latest,thai,american,chinese};
        res.render('index',{title:'Cooking Blog - Home',categories,food});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
}


exports.exploreCategories = async(req,res)=>{
    try{
        const limitNumber = 20;
        const categories = await Category.find().limit(limitNumber);
        res.render('categories',{title:'Cooking Blog - Categories',categories});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
}


exports.exploreCategoriesById = async(req,res)=>{
    try{
        let categoryId = req.params.id;
        const limitNumber = 20;
        const categoryById = await Recipe.find({'category':categoryId}).limit(limitNumber);
        res.render('categories',{title:'Cooking Blog - Categories',categoryById});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
}



exports.exploreRecipe = async(req,res)=>{
    try{
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);
  
        res.render('recipe',{title:'Cooking Blog - Recipe',recipe});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
}
exports.searchRecipe = async (req,res)=>{
    try{
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find({$text:{$search:searchTerm,$diacriticSensitive:true}})
        res.render('search',{title:'Cooking Blog - Search',recipe});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
  
}
exports.exploreLatest = async (req,res)=>{
    try{ 
        const limitNumber = 20;
        const recipe = await Recipe.find().sort({createdAt:-1}).limit(limitNumber);
        res.render('explore-latest',{title:'Cooking Blog - Latest',recipe});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
}
exports.exploreRandom = async (req,res)=>{
    try{
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe  = await Recipe.findOne().skip(random).exec();
        // res.json(recipe);
        res.render('explore-random',{title:'Cooking Blog - Latest',recipe});
    }catch(error){
        res.status(500).send({message:error.message} || 'Error occured')
    }
}
exports.submitRecipe = async(req,res)=>{
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj= req.flash('infoSubmit');
    res.render('submit-recipe',{title:'Cooking Blog - Submit Recipe',infoErrorsObj,infoSubmitObj});
}  
exports.submitRecipeOnPost = async(req,res)=>{
    try{
        let imageUploadFile;
        let uploadPath;
        let newImageName;
        if(!req.files || Object.keys(req.files).length === 0){
            console.log('No files where uploaded');
        }else{
            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;
            uploadPath = require('path').resolve('./')+'/public/uploads/'+newImageName;
            imageUploadFile.mv(uploadPath,(err)=>{
                if(err){
                   return res.status(500).send(err)
                }
            })
        }

        const newRecipe = new Recipe({
            name:req.body.name,
            description:req.body.description,
            email:req.body.email,
            ingredients:req.body.ingredients,
            category:req.body.category,
            image:newImageName

        })
        await newRecipe.save();


        req.flash('infoSubmit','Recipe has been added.')
        res.redirect('/submit-recipe')
    }catch(error){
        req.flash('infoErrors',error);
        res.redirect('/submit-recipe')
    }
   
}

exports.aboutPage = (req,res)=>{
    res.render('about',{title:'Cooking Blog - About Us'})
}
