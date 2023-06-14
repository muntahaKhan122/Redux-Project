import React from 'react';
import { useDispatch } from 'react-redux';
import { reactionAdded } from './postsSlice';


const reactionEmoji = {
    wow: '😮',
    heart: '❤️',
    rocket: '🚀',

}
const ReactionButtons = ({post}) => {
    const dispatch = useDispatch();
    const reactionsBtns = Object.entries(reactionEmoji).map(([name,emoji])=>{
      return (
        <button
         key={name}
         type="button"
         className='reactionButton'
         onClick={()=>dispatch(reactionAdded({postId:post.id,reaction:name}))}>
         {emoji}{post.reactions[name]} 
        </button>
      )
    })
  return <div>{reactionsBtns}</div>
}

export default ReactionButtons