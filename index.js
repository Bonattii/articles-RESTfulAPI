require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the req.body to be used
app.use(bodyParser.urlencoded({ extended: true }));

// Create a mongoDB connection to the DB called wikiDB
mongoose.connect(process.env.MONGO_URI);

// Create a Schema for the articles
const articleSchema = {
  title: {
    type: String,
    require: [true, 'Articles needs to have a name!']
  },
  content: {
    type: String,
    require: [true, 'Articles needs to have a content!']
  }
};

// Moongose convert Article into articles automatically
const Article = mongoose.model('Article', articleSchema);

// localhost:3000/articles
app
  .route('/articles')
  .get((req, res) => {
    // Search for the articles on the collection and send if has any errors
    Article.find((err, foundArticles) => {
      !err ? res.send(foundArticles) : res.send(err);
    });
  })
  .post((req, res) => {
    // Create a new element
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });

    // Save the element into the collection
    newArticle.save(err =>
      err ? res.send(err) : res.send('Successfully added!')
    );
  })
  .delete((req, res) => {
    // Delete every element on the collection articles
    Article.deleteMany(err =>
      err ? res.send(err) : res.send('Successfully deleted all articles!')
    );
  });

// localhost:3000/articles/:articleTitle
app
  .route('/articles/:articleTitle')
  .get((req, res) => {
    // Search for an especific article on the collection and send if has any errors
    Article.findOne({ title: req.params.articleTitle }, (err, foundArticle) => {
      foundArticle
        ? res.send(foundArticle)
        : res.send('No matching article was found');
    });
  })
  .put((req, res) => {
    // Find one article and update all the informations
    Article.findOneAndUpdate(
      { title: req.params.articleTitle },
      { title: req.body.title, content: req.body.content },
      { overwrite: true },
      err => (!err ? res.send('Article successfully updated!') : res.send(err))
    );
  })
  .patch((req, res) => {
    // Find one article and update a specific information
    Article.findOneAndUpdate(
      { title: req.params.articleTitle },
      { $set: req.body },
      err => (!err ? res.send('Article successfully updated!') : res.send(err))
    );
  })
  .delete((req, res) => {
    // Find a specific article and delete it
    Article.deleteOne({ title: req.params.articleTitle }, err =>
      !err ? res.send('Article successfully deleted!') : res.send(err)
    );
  });

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
