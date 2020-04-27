// import and instantiate express
const express = require("express"); // CommonJS import style!
const app = express(); // instantiate an Express object
const bodyParser = require("body-parser");
const logic = require('./logic.js')
const multer = require('./python/multer.js')

app.use(bodyParser.json()); // decode JSON-formatted incoming POST data

var storage = multer.storage
var upload = multer.upload
//GET GENERAL TOKEN
app.get('/token', async (req, res) => {
    const token = await logic.getToken();
    res.send(token);
});

//RECOMMENDATIONS
app.post("/search", async (req, res) => {
    const id = await logic.getArtistId(req.body.token, req.body.artist);
    const recomendations = await logic.getRecs(req.body.token, id, req.body.filters);
    res.send(recomendations);
})

//LOCATION BASED TRACKS
app.post('/nearby', async (req, res) => {
    try {
        console.log(req.body.location)
        let locationResp = await logic.getLocationID(req.body.location)
        let locationId = ((JSON.parse(locationResp)).id).toString()
        let cachedResults = await logic.findTracks(locationId)
        if (cachedResults) {
            console.log('cache hit!')
            res.send(cachedResults)
        }
        else {
            console.log('cache miss')
            let artistsResp = await logic.getNearbyArtists(locationResp, req.body.token)
            let tracksResp = await logic.getTracks(artistsResp, req.body.token)
            try {
                let upload = await logic.uploadTracks(locationId, tracksResp.events)
                console.log('upload success')
                res.send(tracksResp)
            }
            catch{
                console.log('upload failed')
                res.send(undefined)
            }
        }
    }
    catch (error) { console.log(error) }
})

//FACIAL RECOGNITION
app.post('/face', upload.single('face'), async (req, res) => {
    try {
        console.log('recieved face image')
        const emotion = await logic.processFace(req.file.path);
        console.log('emotion: ', emotion);

        res.send(emotion);
    } catch (err) {
        res.send(400);
    }
});

//ANALYTICS

app.post('/monthlyArtist', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "short_term";
    const limit = "3";
    const monthlyArtist = await logic.getArtist(userToken, timeRange, limit);
    res.send(monthlyArtist);
})

app.post('/topGenres', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "short_term";
    const limit = "50";
    const allMonthlyArtists = await logic.getArtist(userToken, timeRange, limit);
    const genres = [];
    for (let i = 0; i < allMonthlyArtists.length; i++) {
        let currArtist = allMonthlyArtists[i];
        let artistGenres = currArtist.genres;
        for (let j = 0; j < artistGenres.length; j++) {
            let currGenre = artistGenres[j];
            let index = genres.findIndex(k => k.genre === currGenre);
            if (index === -1) {
                genres.push({ genre: currGenre, count: 1, image: [currArtist.images[0].url] });
            } else {
                genres[index].count++;
                genres[index].image.push(currArtist.images[0].url);
            }
        }
    }
    genres.sort(function (a, b) { return b.count - a.count });
    console.log(genres);
    res.send(genres.slice(0, 3));
})

app.post('/genreBreakdown', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "short_term";
    const limit = "50";
    const allMonthlyArtists = await logic.getArtist(userToken, timeRange, limit);
    const genres = [];
    for (let i = 0; i < allMonthlyArtists.length; i++) {
        let artistGenres = allMonthlyArtists[i].genres;
        for (let j = 0; j < artistGenres.length; j++) {
            let currGenre = artistGenres[j];
            let index = genres.findIndex(k => k.name === currGenre);
            if (index === -1) {
                genres.push({ name: currGenre, value: 1 });
            } else {
                genres[index].value++;
            }
        }
    }
    genres.sort(function (a, b) { return b.value - a.value });
    res.send(genres);
})

app.post('/topSong', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "short_term";
    const limit = "1";
    const topTrack = await logic.getTrack(userToken, timeRange, limit);
    console.log(JSON.stringify(topTrack));
    res.send(topTrack);
})

app.post('/monthlyTrack', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "short_term";
    const limit = "3";
    const monthlyTrack = await logic.getTrack(userToken, timeRange, limit);
    res.send(monthlyTrack);
})

app.post('/trackMoods', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "short_term";
    const limit = "50";
    const allMonthlyTracks = await logic.getTrack(userToken, timeRange, limit);
    const trackIDs = allMonthlyTracks.map(data => data.id);
    //console.log(trackIDs);
    const allTrackMoods = await Promise.all(trackIDs.map(async (data) => await logic.getTrackMood(data, userToken)));
    res.send(allTrackMoods);
})

app.post('/songFeatures', async (req, res) => {
    const userToken = req.body.token;
    const timeRange = "long_term";
    const limit = "50";
    const topTracks = await logic.getTrack(userToken, timeRange, limit);
    const trackIDs = topTracks.map(data => data.id);
    const trackString = trackIDs.toString();
    const trackFeatures = await logic.getTrackAverageMood(trackString, userToken);
    res.send(trackFeatures);
})

app.post('/yourMood', async(req,res) => {
    try{
        const userToken = req.body.token;
        const timeRange = "short_term";
        const limit = "20";
        const userId = logic.getUserId(userToken).toString();
        console.log("userId" + userId)
        const topTracks = await logic.getTrack(userToken, timeRange, limit);
        const trackString = (topTracks.map(data => data.id)).toString()
        const averageMood = await logic.getTrackAverageMood(trackString, userToken);
        let upload = await logic.uploadMoods(userId, averageMood)
        let cachedResults = await logic.findMoods(userId)
        if (cachedResults){
            console.log('cache hit!')
            console.log(cachedResults)
            res.send(cachedResults)
        }
        else {
            console.log('cache miss')
            res.send("oh")
        }
    }
    catch (error) { 
        console.log(error) 
    }
})

/*app.post('/monthlyArtist', async (req, res) => {
    //TIME-RAGE/LIMIT SHOULD BE SENT IN REQ?
    const timeRange = "short_term";
    const limit = "3";
    const monthlyArtist = await getMonthlyArtist(req.body.token, timeRange, limit);
    res.send(monthlyArtist);
})

app.post('/monthlyTrack', async (req, res) => {
    const monthlyArtist = await getMonthlyArtist(req.body.token, timeRange, limit);
    res.send(monthlyTrack);
})*/



module.exports = app;
