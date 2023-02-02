import request, { gql } from "graphql-request";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BeatLoader } from "react-spinners";

export default function SupportPosts() {
    const { category } = useParams();
    const [posts, setPosts] = useState([]);
    const [specificPosts, setSpecificPosts] = useState([]);
    const [count, setCount] = useState(0);
    const [working, setWorking] = useState(true);

    useEffect(() => {
        const query = gql`
        {
            posts {
                  title
                  id
                  category
                  body {
                    html
                  }
            }
          }
        `
        const fetchPosts = async () => {
            try {
                request(
                    'https://api-eu-west-2.hygraph.com/v2/cla3y5eog35lt01uobdig92vh/master', query).then((data) => {
                        // console.log("data: ", data.posts);
                        // console.log("category: ", category);
                        setPosts(data.posts);
                        setCount(count + 1);
                        let dataa = [];
                        data.posts.forEach((item) => {
                            if (item.category == category.toLowerCase()) {
                                // console.log(item);
                                dataa.push(item);
                            }
                        });
                        setSpecificPosts(dataa);
                        setWorking(false);
                    });

            } catch (error) {
                console.log(error);
            }

        };
        if (count < 1) {
            fetchPosts();
        }
    });

    return (
        <div className="body-col">
            <div className="row">
                <Link className="linksnodecor" to='/support'><h3 className="grey-text">Help</h3></Link>&emsp;{'>'}&emsp;<h3 className="active-text">{category}</h3>
            </div>
            {working? <BeatLoader color="#FF7700"/> : ""}
            {specificPosts.map((object, index) => (
                <Link className="linksnodecor" to={'/support/' + category.toLocaleLowerCase() + '/' + object.title.toLowerCase().replace(/ /g, "-")}
                state={{
                    category,
                    post: object,
                }}><div className="container-grey-bg"><p>{object.title}</p></div>
                </Link>
            ))}
        </div>
    )
}