const Place = require('../models/place');
const { kmeans } = require('ml-kmeans');
const { squaredEuclidean } = require('ml-distance-euclidean');


exports.getTourItinerary = async (lat, long, days, placesAll) => {

    
    var places = placesAll.map((place) => {
        return ({
            id: place._id.toString(),
            name: place.name,
            lat: place.location.coordinates[1],
            long: place.location.coordinates[0]
        })
    })


    places.unshift({ id: "1234", name: "Airport", lat: lat, long: long });


    const places_lat_long = places.map(place => [
        parseFloat(place.lat),
        parseFloat(place.long)
    ]);


    const { clusters, centroids, converged } = kmeans(places_lat_long, days, {
        initialization: 'kmeans++',
        distanceFunction: squaredEuclidean,
        maxIterations: 100
    });


    const replaceGroupToDay = {};
    clusters.forEach((label, index) => {
        replaceGroupToDay[index] = label;
    });


    const seq = [0];
    let curIndex = 0;
    const visitedClusters = new Set([curIndex]);

    while (seq.length < clusters.length) {
        const nearestClusters = centroids
            .map((centroid, index) => [index, squaredEuclidean(centroid, centroids[curIndex])])
            .sort((a, b) => a[1] - b[1])
            .map(item => item[0]);

        let foundNextCluster = false;
        for (const clusterId of nearestClusters) {
            if (clusterId !== curIndex && !visitedClusters.has(clusterId)) {
                seq.push(clusterId);
                curIndex = clusterId;
                visitedClusters.add(clusterId);
                foundNextCluster = true;
                break;
            }
        }

        if (!foundNextCluster) {
            // Handle the case when a valid next cluster is not found
            console.log('Unable to find a valid next cluster. Please check the data or adjust the parameters.');
            break;
        }
    }


    var placesWithDays = places.map((place, index) => ({
        ...place,
        days: replaceGroupToDay[index]
    }));



    placesWithDays = placesWithDays.map((place) => {
        return ({
            ...place,
            days: seq.indexOf(place.days)
        })
    })

    placesWithDays.sort((a, b) => a.days - b.days);



    var finalPlaceList = Array.from({ length: days }, () => []);

    for (let place of placesWithDays) {
        let matchingPlace = placesAll.find(pl => pl._id.toString() === place.id);
    
        if (matchingPlace) {
            finalPlaceList[place.days].push(matchingPlace);
        }
    }
    


    return finalPlaceList
}