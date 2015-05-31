/**
 * Created by Ryan Berg on 5/17/15.
 * rberg2@hotmail.com
 */



//TODO: no user location infowindow
var initialLocation = new google.maps.LatLng(47.609351, -122.325263);//Seattle
var browserSupportFlag =  false;

//var infowindow = new google.maps.InfoWindow;
var userMarker;
var userMarkerIdentifier = 'User Location';
var lastOpenInfoWindow;

var isInfoWindowOpen = false;
var pinningLocation = false;

var businessMarkersArray = [];

function addMarkerTo(map, businessObject)
{
    var infowindow = new google.maps.InfoWindow;

    if(businessObject.name != userMarkerIdentifier)
    {
        var minPhoneNumber = businessObject.phoneNumber.replace(/[() ]*/g, '');

        infowindow.setContent('<h4>' + businessObject.name +
            '</h4><p>' + businessObject.address.street + '<br>' + businessObject.address.city +
            ', ' + businessObject.address.state + '<br><a href="tel:+1' + minPhoneNumber +
            '">' + businessObject.phoneNumber + '</a><br><a href="http://google.com/maps/dir/' + initialLocation.lat() + ',' + initialLocation.lng() + '/' + businessObject.address.fullAddress
            + '">get directions</a>');
    }
    else
    {
        infowindow.setContent('<h4>' + businessObject.name + '</h4>');
    }

    var circle ={
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: .4,
        scale: 4.5,
        strokeColor: 'white',
        strokeWeight: 1
    };

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(businessObject.latitude, businessObject.longitude),
        map: map,
        title: businessObject.name,
        icon: circle
    });
    google.maps.event.addListener(marker, 'click', function()
    {
        infowindow.setContent
        (
            '<!DOCTYPE html><html><head lang="en"> <meta charset="UTF-8"></head><body><h4>'+
            businessObject.name+'</h4><p>'+businessObject.address.street+'<br>'+businessObject.address.city+
            ', '+businessObject.address.state+'<br><a href="tel:+1'+minPhoneNumber+'">'+businessObject.phoneNumber+
            '</a></p><button class="btn btn-warning" id="check-wifi" style="outline: none">check wifi</button><a target="_blank" href="http://google.com/maps/dir/' +
            initialLocation.lat() + ',' + initialLocation.lng() + '/' + businessObject.address.fullAddress+
            '"><button class="btn btn-primary">get directions</button></a><a target="_blank" style="display: block; padding-top: 4px" href="http://yelp.com/biz/'+
            businessObject._id+'">More info on Yelp</a>'
        );

        google.maps.event.addListener(infowindow,'domready',function()
        {
            var wifiButton = document.getElementById("check-wifi");
            var wifiCheckWasClicked = false;



            wifiButton.addEventListener("click", function()
            {
                if(!wifiCheckWasClicked)
                {
                    wifiCheckWasClicked = true;

                    wifiButton.innerHTML = '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> checking';
//TODO: set timeout

                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", 'http://turingweb.com:10000/wifi_check?business_id='+businessObject._id, true);
                    xhr.onload = function ()
                    {
                        if (xhr.readyState === 4)
                        {
                            if (xhr.status === 200)
                            {
                                wifiButton.innerHTML = xhr.responseText;
                                wifiButton.className = 'btn btn-success';
                            }
                            else
                            {
                                console.error(xhr.statusText);
                            }
                        }
                    };
                    xhr.onerror = function ()
                    {
                        console.error(xhr.statusText);
                    };
                    xhr.send(null);
                }
            });
        });

        //infowindow.setContent('<h4>' + businessObject.name +
        //    '</h4><p>' + businessObject.address.street + '<br>' + businessObject.address.city +
        //    ', ' + businessObject.address.state + '<br><a href="tel:+1' + minPhoneNumber +
        //    '">' + businessObject.phoneNumber + '</a><br><a href="http://google.com/maps/dir/' + initialLocation.lat() + ',' + initialLocation.lng() + '/' + businessObject.address.fullAddress
        //    + '">get directions  </a>');

        if(lastOpenInfoWindow)
        {
            lastOpenInfoWindow.close();
        }
        infowindow.open(map,marker);
        isInfoWindowOpen = true;
        console.log('true');
        lastOpenInfoWindow = infowindow;
    });

    if(businessObject.name == userMarkerIdentifier)
    {
        userMarker = marker;
        circle.fillColor =  'black';
        circle.fillOpacity = 1;
        userMarker.setIcon(circle);
    }
    else
    {
        businessMarkersArray.push(marker);
    }
}

function setAllMap(map)
{
    for (var i = 0; i < businessMarkersArray.length; i++) {
        businessMarkersArray[i].setMap(map);
    }
}

function callWifiAPI(latitude, longitude, map)
{
    setAllMap(null);

    var wifiAPIString = 'http://www.turingweb.com:10000/search?latitude='+latitude+'&longitude='+longitude+'&radius=3';

    console.log(wifiAPIString);

    $.get(wifiAPIString, function(data)
    {
        console.log(data);
        if(data)
        {
            for(var i = 0; i < data.length; i++)
            {
                addMarkerTo(map, data[i]);
            }
        }
    });
}

function initialize()
{
    var myOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

    google.maps.event.addListener(map, 'click', function(event)
    {
        if(pinningLocation)
        {
            //initialLocation = event.latLng;
            pinningLocation = false;
            map.setOptions({draggableCursor: 'url(https://maps.google.com/mapfiles/openhand.cur), move'});
            map.panTo(event.latLng);
            callWifiAPI(event.latLng.lat(), event.latLng.lng(), map);
            userMarker.setPosition(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
        }
        if(lastOpenInfoWindow)
        {
            lastOpenInfoWindow.close();
            isInfoWindowOpen = false;
        }
    });


    var pinButton = document.getElementById('pinButton');

    pinButton.addEventListener("click", function()
    {
        pinningLocation = true;
        map.setOptions({draggableCursor: 'crosshair'});
        if(lastOpenInfoWindow)
        {
            lastOpenInfoWindow.close();
            isInfoWindowOpen = false;
        }
    });

    var input = /** @type {HTMLInputElement} */(
        document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var searchBox = new google.maps.places.SearchBox
    (
        /** @type {HTMLInputElement} */(input));

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function()
    {
        var placesArray = searchBox.getPlaces();
        console.log(placesArray)

        processSearchBoxResults(placesArray, map);
    });
        // Try W3C Geolocation (Preferred)
    if(navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position)
        {
            initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            initMap(map, input);

        }, function()
        {
            initMap(map, input);
            //handleNoGeolocation(browserSupportFlag);
        });
    }
    else //Browser doesn't support Geolocation
    {
        browserSupportFlag = false;
        initMap(map, input);
        //handleNoGeolocation(browserSupportFlag);
    }

    function handleNoGeolocation(errorFlag)
    {
        if (errorFlag == true)
        {
            alert("Geolocation service failed.");
        }
        else
        {
            alert("Your browser doesn't support geolocation.");
        }

        map.setCenter(initialLocation);
    }
}

function processSearchBoxResults(placesArray, map)
{
    var type = placesArray[0].types[0];

    switch (type)
    {
        case 'administrative_area_level_1':
        case 'administrative_area_level_2':
        case 'administrative_area_level_3':
        case 'administrative_area_level_4':
        case 'administrative_area_level_5':
        case 'colloquial_area':
        case 'country':
        case 'floor':
        case 'geocode':
        case 'intersection':
        case 'locality':
        case 'natural_feature':
        case 'neighborhood':
        case 'political':
        case 'point_of_interest':
        case 'post_box':
        case 'postal_code':
        case 'postal_code_prefix':
        case 'postal_code_suffix':
        case 'postal_town':
        case 'premise':
        case 'street_address':
        case 'street_number':
        case 'sublocality_level_4':
        case 'sublocality_level_5':
        case 'sublocality_level_3':
        case 'sublocality_level_2':
        case 'sublocality_level_1':
        case 'subpremise':
        case 'transit_station':
            var latitude = placesArray[0].geometry.location.A;
            var longitude = placesArray[0].geometry.location.F;

            console.log(latitude + ', ' + longitude);

            map.panTo({lat:placesArray[0].geometry.location.A, lng:placesArray[0].geometry.location.F});
            callWifiAPI(latitude, longitude, map);
            userMarker.setPosition(new google.maps.LatLng(latitude, longitude));
            break;
        default:
            //TODO: handle non geographical places input
            console.log('other');
    }
}

function initMap(map, searchBox)
{
    document.getElementById("outer").style.visibility = 'hidden';
    document.getElementById("map-canvas").style.visibility = 'visible';
    pinButton.style.visibility = 'visible';
    searchBox.style.visibility = 'visible';
    map.setCenter(initialLocation);

    //init user marker
    addMarkerTo(map, {name: userMarkerIdentifier, latitude: initialLocation.lat(), longitude: initialLocation.lng()});

    //TODO: fix info window of user location

    callWifiAPI(initialLocation.lat(), initialLocation.lng(), map);
}

google.maps.event.addDomListener(window, 'load', initialize);