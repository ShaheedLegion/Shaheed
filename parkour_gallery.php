<!DOCTYPE html>
<html>
<head>
	<title>Shaheed Abdol - Parkour Image Gallery</title>
	<meta name="description" content="Shaheed Abdol, Shaheed Abdol - Programmer, Personal Website for Shaheed Abdol"/>
	<link rel="stylesheet" href="css/main.css" type="text/css" media="all" />
    <link rel="stylesheet" href="css/default.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="css/nivo-slider.css" type="text/css" media="screen" />

	<script src="js/jquery-latest.min.js" type="text/javascript"></script>
	<script src="js/navigation.js" type="text/javascript"></script>
<head>

<body>

<div class="menubar" id="menubar">
<object data="menu.html" class="menudata"></object>
	<a href="#" id="toggle" class="menubutton">
		<div class="menubutton" id="menubtn" data-role="button">
		<div class="centermenu"><p>Menu</p></div>
		</div>
	</a>
</div>

<div id="wrapper" class="bodycontent">
<?php
include "social_snippets.php";
?>

	<div class="slider-wrapper theme-default">
		<div id="slider" class="nivoSlider">
		<img src="galleries/parkour/1.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap1" />
		<img src="galleries/parkour/2.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap2" />
		<img src="galleries/parkour/3.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap3" />
		<img src="galleries/parkour/4.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap4" />
		<img src="galleries/parkour/5.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap5" />
		<img src="galleries/parkour/6.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap6" />
		<img src="galleries/parkour/7.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap7" />
		<img src="galleries/parkour/8.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap8" />
		<img src="galleries/parkour/9.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap9" />
		<img src="galleries/parkour/10.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap10" />
		<img src="galleries/parkour/11.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap11" />
		<img src="galleries/parkour/12.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap12" />
		<img src="galleries/parkour/13.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap13" />
		<img src="galleries/parkour/14.jpg" data-thumb="" alt="" data-transition="slideInLeft" title="#cap14" />
		<img src="galleries/parkour/15.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap15" />
		<img src="galleries/parkour/16.jpg" data-thumb="" alt="" data-transition="slideInRight" title="#cap16" />
		</div>
		<div id="cap1" class="nivo-html-caption">Junaid Samaai doing a backflip at the Waterfront.</div>
		<div id="cap2" class="nivo-html-caption">Shaheed Abdol cat-walking down a railing.</div>
		<div id="cap3" class="nivo-html-caption">Junaid and Ahsheed "Hanging out".</div>
		<div id="cap4" class="nivo-html-caption">Shaheed posing for a poster shot.</div>
		<div id="cap5" class="nivo-html-caption">Junaid scaling a building in Cape Town.</div>
		<div id="cap6" class="nivo-html-caption">Junaid leaping over the camera for a poster shot.</div>
		<div id="cap7" class="nivo-html-caption">Junaid flies over a wall in Cape Town.</div>
		<div id="cap8" class="nivo-html-caption">Shaheed leaps over a wall in Cape Town.</div>
		<div id="cap9" class="nivo-html-caption">Junaid and Shaheed at the company Gardens.</div>
		<div id="cap10" class="nivo-html-caption">Junaid doing a poster shot in front of the Museum in Cape Town.</div>
		<div id="cap11" class="nivo-html-caption">Shaheed shows the balance required for Parkour.</div>
		<div id="cap12" class="nivo-html-caption">Shaheed performs a jump for a poster.</div>
		<div id="cap13" class="nivo-html-caption">Close up of Shaheed's balance demonstration.</div>
		<div id="cap14" class="nivo-html-caption">Poster shot of Shaheed from a different angle.</div>
		<div id="cap15" class="nivo-html-caption">Junaid and Shaheed show their balance skills in front of the Museum in Cape Town.</div>
		<div id="cap16" class="nivo-html-caption">Junaid shows some more balance skill at the Waterfront</div>
	</div>

</div>
<script type="text/javascript" src="js/jquery.nivo.slider.js"></script>
<script type="text/javascript">
$(window).load(function() {
	$('#slider').nivoSlider();
});
</script>
<body>
</html>