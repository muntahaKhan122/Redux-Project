 import { createSlice, nanoid,createAsyncThunk
 } from "@reduxjs/toolkit";
import {sub} from 'date-fns';
import axios from "axios";
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

const initialState = {
    posts:[],
    status:'idle', //'idle','loading,'succeeded','failed'
    error: null
 };

 export const fetchPosts = createAsyncThunk('posts/fetchPosts',async () => {
    try{
        const response = await axios.get(POSTS_URL);
        return response.data;
    }
    catch(err){
       return err.message;
    }
 });

 export const updatePost = createAsyncThunk('posts/updatePosts',async (data) => {

     const {id} = data;
     try{
         const response = await axios.put(`${POSTS_URL}/${id}`,data);
         return response.data;

     } catch (err) {
         return data; 
     }
 });

 export const deletePost = createAsyncThunk('posts/deletePost',async(data)=>{

    const {id} = data;
    try{

        const response = await axios.delete(`${POSTS_URL}/${id}`);
        if(response?.status === 200) return data;
        return `${response?.status}: ${response?.statusText}`;
        

    } catch(err) {
       return err.message;
    }
 });
 export const addNewPost = createAsyncThunk('posts/addNewPost',async(initialPost)=>{
    const response= await axios.post(POSTS_URL,initialPost);
    return response.data;

 })
 const postsSlice =  createSlice({
    name:'posts',
    initialState,
    reducers: {
        postAdded: {
            reducer(state,action){
                state.posts.push(action.payload);
             },
             prepare(title,content,userId){
               return{
                payload: {
                    id:nanoid(),
                    title,
                    content,
                    date: new Date().toISOString(),
                    userId,
                    reactions:{
                        wow:0,
                        heart:0,
                        rocket:0,
                    }
                }
               } 

             }
        },

        reactionAdded(state,action){
          const {postId,reaction}= action.payload;
          const existing = state.posts.find(post=>post.id === postId);
          if(existing)
          {
            existing.reactions[reaction]++;
          }
        },

        
    },
    extraReducers(builder)
        {
            builder
            .addCase(fetchPosts.pending, (state, action) => {
                state.status = 'loading';
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Adding date and reactions
                let min = 1;
                const loadedPosts = action.payload.map(post => {
                    post.date = sub(new Date(), { minutes: min++ }).toISOString();
                    post.reactions = {
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                       }
                    return post;
                });

                // Add any fetched posts to the array
                state.posts = state.posts.concat(loadedPosts)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled,(state,action)=>{
                const sortedPosts = state.posts.sort((a, b) => {
                    if (a.id > b.id) return 1
                    if (a.id < b.id) return -1
                    return 0
                })
                action.payload.id = sortedPosts[sortedPosts.length - 1].id + 1;
                // End fix for fake API post IDs 

                action.payload.userId = Number(action.payload.userId)
                action.payload.date = new Date().toISOString();
                action.payload.reactions = {
                    wow: 0,
                    heart: 0,
                    rocket: 0,

                }

                state.posts.push(action.payload)
            }).addCase(updatePost.fulfilled,(state,action)=>{
                
                if(!action.payload?.id){
                    console.log('Update could not complete');
                    console.log(action.payload);
                    return;
                }
                
                
                const {id} = action.payload;
                action.payload.date= new Date().toISOString();
                const posts = state.posts.filter(p => p.id !== id);
                state.posts = [...posts,action.payload];
            }).addCase(deletePost.fulfilled,(state,action)=>{
                if(action.payload?.id){
                    console.log('Delete could not complete');
                    console.log(action.payload);
                    return;
                }
                const { id }= action.payload;
                const posts = state.posts.filter(post =>post.id !== id);
                state.posts = posts;
            })
        }
 });

export const selectAllPosts = (state) => state.posts.posts;
export const getPostStatus = (state) => state.posts.status;

export const getPostsErr = (state) => state.posts.error;
export const selectPostById = (state,id) => state.posts.posts.find(p=>p.id===id);

export const {postAdded,reactionAdded} = postsSlice.actions;
 export default postsSlice.reducer;