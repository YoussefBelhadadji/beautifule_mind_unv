(function($) {
    "use strict";

    $(document).ready(function() {
        // Check if the map container exists
        if ($('#contact-map-modern').length) {

            // Map Coordinates (Algiers, Algeria)
            var lat = 36.7763;
            var lng = 3.0588;
            var myLatlng = new google.maps.LatLng(lat, lng);

            // Map Options
            var mapOptions = {
                zoom: 14,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: false, // Prevents zooming on scroll
                // Add custom styles to the map for a professional look
                styles: [
                    { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#e9e9e9" }, { "lightness": 17 } ] },
                    { "featureType": "landscape", "elementType": "geometry", "stylers": [ { "color": "#f5f5f5" }, { "lightness": 20 } ] },
                    { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#ffffff" }, { "lightness": 17 } ] },
                    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 } ] },
                    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [ { "color": "#ffffff" }, { "lightness": 18 } ] },
                    { "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#ffffff" }, { "lightness": 16 } ] },
                    { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#f5f5f5" }, { "lightness": 21 } ] },
                    { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#dedede" }, { "lightness": 21 } ] },
                    { "elementType": "labels.text.stroke", "stylers": [ { "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 } ] },
                    { "elementType": "labels.text.fill", "stylers": [ { "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 } ] },
                    { "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] },
                    { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#f2f2f2" }, { "lightness": 19 } ] },
                    { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "color": "#fefefe" }, { "lightness": 20 } ] },
                    { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 } ] }
                ]
            };

            // Create the Map
            var map = new google.maps.Map(document.getElementById('contact-map-modern'), mapOptions);

            // Create the Marker
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'مركز العقل الجميل'
            });
        }
    });

})(jQuery);