import mongoose from './index.js';

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    picture: {
        type: String,
       
    },
    username: {
        type: String,
        required:false
    },
    categories: {
        type: Array,
        required: false   
    },
    createdDate: {
        type: Date
    }
});


const Post = mongoose.model('post', PostSchema);

export default Post;