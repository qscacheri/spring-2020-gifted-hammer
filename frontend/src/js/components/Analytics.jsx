/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import '../../css/Analytics.css'
import {
    XAxis, YAxis, Tooltip, Legend, PieChart, Pie, BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { useState, useEffect } from 'react';
let Analytics = (props) => {

    const [topSongData, setTopSongData] = useState({})
    const [topGenres, setTopGenres] = useState({})
    const [genreBreakdown, setGenreBreakdown] = useState([])
    const [trackMoods, setTrackMoods] = useState([])
    const [topArtistsInArea, setTopArtistsInArea] = useState([])
    const [yourMoods, setYourMoods] = useState([])
    const [yourTopSongs, setYourTopSongs] = useState([])
    const accessToken = props.accessToken

    const [hasError, setErrors] = useState(false);
    async function fetchData() {
        // console.log(accessToken);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: accessToken,
                location: props.location
            })
        };

        // console.log((await fetch('/topSong', requestOptions)).json());
        fetch(process.env.REACT_APP_SERVER + '/topSong', requestOptions)
            .then(response => response.json())
            .then(data => formatTopSong(data));

        fetch(process.env.REACT_APP_SERVER + '/topGenres', requestOptions)
            .then(response => response.json())
            .then(data => formatMonthlyGenre(data));

        fetch(process.env.REACT_APP_SERVER + '/genreBreakdown', requestOptions)
            .then(response => response.json())
            .then(data => setGenreBreakdown(data));

        fetch(process.env.REACT_APP_SERVER + '/trackMoods', requestOptions)
            .then(response => response.json())
            .then(data => setTrackMoods(data));

        fetch(process.env.REACT_APP_SERVER + '/areaSearch', requestOptions)
            .then(response => response.json())
            .then(data => setTopArtistsInArea(data));

        fetch(process.env.REACT_APP_SERVER + '/yourMood', requestOptions)
            .then(response => response.json())
            .then(data => setYourMoods(data));

        fetch(process.env.REACT_APP_SERVER + '/yourTopSongs', requestOptions)
            .then(response => response.json())
            .then(data => setYourTopSongs(data));
    }


    const formatTopSong = data => {
        let topSong = {};
        topSong.name = data[0].name;
        topSong.artist = data[0].artists[0].name;
        topSong.image = data[0].album.images[0].url;
        setTopSongData(topSong);
    }

    const formatMonthlyGenre = data => {
        let topGenre = {};
        topGenre.firstName = data[0].genre;
        const random1 = Math.floor((Math.random() * data[0].image.length - 1) + 1);
        topGenre.firstImage = data[0].image[random1];
        topGenre.secondName = data[1].genre;
        const random2 = Math.floor((Math.random() * data[1].image.length - 1) + 1);
        topGenre.secondImage = data[1].image[random2];
        topGenre.thirdName = data[2].genre;
        const random3 = Math.floor((Math.random() * data[2].image.length - 1) + 1);
        topGenre.thirdImage = data[2].image[random3];
        setTopGenres(topGenre);
    }

    useEffect(() => {
        fetchData();
    }, []);
    return (
        <div className="analytics">
            {/* <div className='section'>
                <SectionHeading name="This month you listened to..."></SectionHeading>
                <div className='overview'>
                    <div className="overviewOne">
                        <BigMetric value='1005' descriptor="Minutes of music"></BigMetric>
                    </div>
                    <div className="overviewTwo">
                        <Metric value="17" descriptor="Albums"></Metric>
                        <Metric value="200" descriptor="Artists"></Metric>
                        <Metric value="400" descriptor="Songs"></Metric>
                    </div>
                </div>
            </div> */}
            <div className='section'>
                <SectionHeading name="This Month's Top 3 Genres"></SectionHeading>
                <div className='genres'>
                    <Genere name={topGenres.firstName} image={topGenres.firstImage}></Genere>
                    <Genere name={topGenres.secondName} image={topGenres.secondImage}></Genere>
                    <Genere name={topGenres.thirdName} image={topGenres.thirdImage}></Genere>
                </div>
            </div>
            <div className='section'>
                <SectionHeading name='Top Song'></SectionHeading>
                <div className='topSong'>
                    <div className="topSongOne">
                        <Metric value={topSongData.name} descriptor={topSongData.artist}></Metric>
                        {/* <p>You listened 500 times!</p> */}
                    </div>
                    <img className="topImg" src={topSongData.image} alt="album art"></img>
                </div>
            </div>
            <div className='section'>
                <SectionHeading name='Moods of Your Top Songs'></SectionHeading>
                <div className='moodChart'>
                    <div id="label">
                        <p id="happyLabel">Happy</p>
                        <p id="sadLabel">Sad</p>
                    </div>
                    <MoodChart data={trackMoods}></MoodChart>
                </div>
            </div>
            <div className='section'>
                <SectionHeading name='Your Monthly Genre Breakdown'></SectionHeading>
                <div className='sectionBody genereChart'>
                    <GenereChart data={genreBreakdown}></GenereChart>
                </div>
            </div>

            <div>
                <p> Your Stored Record With Spotilytics </p>
                <br></br>
            </div>

            <div className='section'>
                <SectionHeading name='Average Mood of Songs'></SectionHeading>
                <div className='moodChart'>
                    <MoodChart2 data={yourMoods}></MoodChart2>
                </div>
            </div>

            <div className='section'>
                <SectionHeading name="Past Top Songs"></SectionHeading>
                <div className='songs'>
                    {!yourTopSongs.songs ? null :
                        <>
                            <Song name={yourTopSongs.songs[0][0]} image={yourTopSongs.songs[0][1]} time="Past 1 Month"></Song>
                            <Song name={yourTopSongs.songs[1][0]} image={yourTopSongs.songs[1][1]} time="Past 6 Months"></Song>
                            <Song name={yourTopSongs.songs[2][0]} image={yourTopSongs.songs[2][1]} time="Past 2 Years"></Song>
                        </>
                    }
                </div>
            </div>

            <div className='section areaArtists'>
                <SectionHeading name='People in your area have also searched:'></SectionHeading>
                <div className='sectionBody'>
                    <ul>
                        <li>{topArtistsInArea[0]}</li>
                        <li>{topArtistsInArea[1]}</li>
                        <li>{topArtistsInArea[2]}</li>

                    </ul>
                </div>
            </div>

        </div>
    )
}
let SectionHeading = (props) => {
    return (
        <div>
            <h2 className="sectionTitle">{props.name}</h2>
        </div>
    )
}
let Metric = (props) => {
    return (
        <div className="bigMetric">
            <h3>{props.value}</h3>
            <h4>{props.descriptor}</h4>
        </div>
    )
}

let Genere = (props) => {
    return (
        <div className="genere">
            <h4>{props.name}</h4>
            <img className="genereImg" src={props.image}></img>
        </div>
    )
}
let Song = (props) => {
    // console.log(props);
    // if(props.data.length === 0){
    //     return null
    // }
    return (
        <div className="song">
            <h4>{props.name}</h4>
            <img className="songImg" src={props.image}></img>
            <h5>{props.time}</h5>
        </div>
    )
}
let MoodChart = (props) => {
    const data = [];
    for (let i = 0; i < props["data"].length; i++) {
        const dataval = {};
        dataval.moodScore = props["data"][i]["valence"];
        dataval.name = props["data"][i]["id"];
        data.push(dataval);
    }

    return (
        <BarChart
            width={800}
            height={200}
            data={data}
            margin={{
                top: 10, right: 10, left: 0, bottom: 5,
            }}
        >
            <XAxis dataKey="name" tick={false} />
            <YAxis tick={false} />
            <Tooltip label='cum' />
            <Bar dataKey="moodScore" fill="#8884d8" />
        </BarChart>
    )
}

let MoodChart2 = (props) => {
    // console.log(props)
    const data = [];
    if (props.data.length === 0) {
        return null
    }
    for (let i = 0; i < props.data[0].moods.length; i++) {
        const dataval = {};
        dataval.moodScore = props.data[0].moods[i];
        dataval.name = i;
        data.push(dataval);
    }
    return (
        <BarChart
            width={800}
            height={200}
            data={data}
            margin={{
                top: 10, right: 10, left: 0, bottom: 5,
            }}
        >
            <XAxis dataKey="name" tick={false} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="moodScore" fill="#8884d8" />
        </BarChart>
    )
}
let GenereChart = (props) => {
    const data01 = [];
    for (let i = 0; i < props["data"].length; i++) {
        if (i > 10) {
            break;
        }
        const dataval = {};
        dataval.name = props["data"][i].name;
        dataval.value = props["data"][i].value;
        data01.push(dataval);
    }


    return (
        <PieChart width={800} height={400}
            margin={{
                top: 0, right: 40, left: 20, bottom: 0,
            }}>
            <Pie dataKey='value' data={data01} cx={400} cy={200} innerRadius={80} outerRadius={160} fill="#8884d8" />
            <Tooltip />
        </PieChart>
    )

}

export default Analytics