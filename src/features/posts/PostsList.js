import React  from 'react'
import {  useSelector } from 'react-redux';
import { selectAllPosts,getPostStatus,getPostsErr } from './postsSlice';
import PostExcerpt from './PostExcerpt';
const PostsList = () => {

  const posts = useSelector(selectAllPosts);
  const postsStatus = useSelector(getPostStatus);
  const error = useSelector(getPostsErr);




  let content;
  if(postsStatus === 'loading'){
    content = <p>"Loading..."</p>
  }
  else if(postsStatus === 'succeeded')
  {
    const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))

    content = orderedPosts.map(post=><PostExcerpt key={post.id} post={post}/>)
    
  }
  else if(postsStatus=== 'failed')
  {
    content = <p>{error}</p>
  }

  return(
    <section>
        <h2>Posts</h2>
        {content} 
    </section>
  )
}

export default PostsList;