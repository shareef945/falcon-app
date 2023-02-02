import React from "react";
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { Link, useLocation } from "react-router-dom";

export default function SupportPost() {
    const location = useLocation();
    const stateObj = location.state;
   
    return (
        <div className="body-col">
            <div className="row">
                <Link className="linksnodecor" to='/support'><p className="grey-text">Help</p></Link>&emsp;{'>'}&emsp;<Link className="linksnodecor" to={'/support/'+stateObj.category}><p className="grey-text">{stateObj.category}</p></Link>&emsp;{'>'}&emsp;<p className="active-text">{stateObj.post.title}</p>
            </div>

            <ReactMarkdown rehypePlugins={[rehypeRaw]} children={stateObj.post.body.html}/>
            

        </div>
    )
}