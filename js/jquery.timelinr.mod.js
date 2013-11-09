/* ----------------------------------
jQuery Timelinr 0.9.53
tested with jQuery v1.6+

Copyright 2011, CSSLab.cl
Free under the MIT license.
http://www.opensource.org/licenses/mit-license.php

instructions: http://www.csslab.cl/2011/08/18/jquery-timelinr/
---------------------------------- */
var _settings = 0;
var _containerid = -1;
jQuery.fn.timelinr = function(options){
	// default plugin settings
	_settings = jQuery.extend({
		containerDiv: 				'',		// value: any HTML tag or #id, default to #timeline
		datesDiv: 					'',			// value: any HTML tag or #id, default to #dates
		datesSelectedClass: 		'selected',			// value: any class, default to selected
		datesSpeed: 				'normal',			// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to normal
		issuesDiv: 					'',			// value: any HTML tag or #id, default to #issues
		issuesSelectedClass: 		'selected',			// value: any class, default to selected
		issuesSpeed: 				'fast',				// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to fast
		issuesTransparency: 		0.2,				// value: integer between 0 and 1 (recommended), default to 0.2
		issuesTransparencySpeed: 	500,				// value: integer between 100 and 1000 (recommended), default to 500 (normal)
		prevButton: 				'#prev',			// value: any HTML tag or #id, default to #prev
		nextButton: 				'#next',			// value: any HTML tag or #id, default to #next
		arrowKeys: 					'false',			// value: true | false, default to false
		startAt: 					1,					// value: integer, default to 1 (first)
		autoPlay: 					'false',			// value: true | false, default to false
		autoPlayDirection: 			'forward',			// value: forward | backward, default to forward
		autoPlayPause: 				2000,				// value: integer (1000 = 1 seg), default to 2000 (2segs)
		callback: setDims,
		update: setUpdate
	}, options);

	var howManyDates;
	var howManyIssues;
	var currentDate;
	var currentIssue;
	var widthContainer;
	var heightContainer;
	var widthIssues;
	var heightIssues;
	var widthIssue;
	var heightIssue;
	var widthDates;
	var heightDates;
	var widthDate;
	var heightDate;
	var defaultPositionDates;
	
	function setDims()
	{
		// setting variables... many of them
		howManyDates = $(_settings.datesDiv+' li').length;
		howManyIssues = $(_settings.issuesDiv+' li').length;
		currentDate = $(_settings.datesDiv).find('a.'+_settings.datesSelectedClass);
		currentIssue = $(_settings.issuesDiv).find('li.'+_settings.issuesSelectedClass);
		widthContainer = $(_settings.containerDiv).width();
		heightContainer = $(_settings.containerDiv).height();
		widthIssues = widthContainer - 50;//give it some room to breathe
		
		//set the width of each issue to the width of parent container of list
		$('.issues li').width(widthIssues + 'px');
		
		heightIssues = $(_settings.issuesDiv).height();
		widthIssue = $(_settings.issuesDiv+' li').width();
		heightIssue = $(_settings.issuesDiv+' li').height();
		widthDates = $(_settings.datesDiv).width();
		heightDates = $(_settings.datesDiv).height();
		widthDate = $(_settings.datesDiv+' li').width();
		heightDate = $(_settings.datesDiv+' li').height();
		
		// set positions!
		$(_settings.issuesDiv).width(widthIssue*howManyIssues);
		$(_settings.datesDiv).width(widthDate*howManyDates).css('marginLeft',widthContainer/2-widthDate/2);
		defaultPositionDates = parseInt($(_settings.datesDiv).css('marginLeft').substring(0,$(_settings.datesDiv).css('marginLeft').indexOf('px')));
	}
	
	function setUpdate(_id, _call)
	{
		_settings.containerDiv = '#timeline' + _id;
		_settings.datesDiv = '#dates' + _id;
		_settings.issuesDiv = '#issues' + _id;
		if (_call)
			_settings.callback();
		$(_settings.datesDiv+' li').eq(_settings.startAt - 1).find('a').trigger('click');
	}
	
	$(function(){
		$(_settings.datesDiv+' a').click(function(event){
			event.preventDefault();
			// first vars
			var whichIssue = $(this).text();
			var currentIndex = $(this).parent().prevAll().length;
			// moving the elements
			$(_settings.issuesDiv).animate({'marginLeft':-widthIssue*currentIndex},{queue:false, duration:_settings.issuesSpeed});
			$(_settings.issuesDiv+' li').animate({'opacity':_settings.issuesTransparency},{queue:false, duration:_settings.issuesSpeed}).removeClass(_settings.issuesSelectedClass).eq(currentIndex).addClass(_settings.issuesSelectedClass).fadeTo(_settings.issuesTransparencySpeed,1);
			// prev/next buttons now disappears on first/last issue | bugfix from 0.9.51: lower than 1 issue hide the arrows | bugfixed: arrows not showing when jumping from first to last date
			if(howManyDates == 1) {
				$(_settings.prevButton+','+_settings.nextButton).fadeOut('fast');
			} else if(howManyDates == 2) {
				if($(_settings.issuesDiv+' li:first-child').hasClass(_settings.issuesSelectedClass)) {
					$(_settings.prevButton).fadeOut('fast');
				 	$(_settings.nextButton).fadeIn('fast');
				} 
				else if($(_settings.issuesDiv+' li:last-child').hasClass(_settings.issuesSelectedClass)) {
					$(_settings.nextButton).fadeOut('fast');
					$(_settings.prevButton).fadeIn('fast');
				}
			} else {
				if( $(_settings.issuesDiv+' li:first-child').hasClass(_settings.issuesSelectedClass) ) {
					$(_settings.nextButton).fadeIn('fast');
					$(_settings.prevButton).fadeOut('fast');
				} 
				else if( $(_settings.issuesDiv+' li:last-child').hasClass(_settings.issuesSelectedClass) ) {
					$(_settings.prevButton).fadeIn('fast');
					$(_settings.nextButton).fadeOut('fast');
				}
				else {
					$(_settings.nextButton+','+_settings.prevButton).fadeIn('slow');
				}	
			}
			// now moving the dates
			$(_settings.datesDiv+' a').removeClass(_settings.datesSelectedClass);
			$(this).addClass(_settings.datesSelectedClass);
			$(_settings.datesDiv).animate({'marginLeft':defaultPositionDates-(widthDate*currentIndex)},{queue:false, duration:'_settings.datesSpeed'});
		});

		$(_settings.nextButton).bind('click', function(event){
			event.preventDefault();
			var currentPositionIssues = parseInt($(_settings.issuesDiv).css('marginLeft').substring(0,$(_settings.issuesDiv).css('marginLeft').indexOf('px')));
			var currentIssueIndex = currentPositionIssues/widthIssue;
			var currentPositionDates = parseInt($(_settings.datesDiv).css('marginLeft').substring(0,$(_settings.datesDiv).css('marginLeft').indexOf('px')));
			var currentIssueDate = currentPositionDates-widthDate;
			if(currentPositionIssues <= -(widthIssue*howManyIssues-(widthIssue))) {
				$(_settings.issuesDiv).stop();
				$(_settings.datesDiv+' li:last-child a').click();
			} else {
				if (!$(_settings.issuesDiv).is(':animated')) {
					$(_settings.issuesDiv).animate({'marginLeft':currentPositionIssues-widthIssue},{queue:false, duration:_settings.issuesSpeed});
					$(_settings.issuesDiv+' li').animate({'opacity':_settings.issuesTransparency},{queue:false, duration:_settings.issuesSpeed});
					$(_settings.issuesDiv+' li.'+_settings.issuesSelectedClass).removeClass(_settings.issuesSelectedClass).next().fadeTo(_settings.issuesTransparencySpeed, 1).addClass(_settings.issuesSelectedClass);
					$(_settings.datesDiv).animate({'marginLeft':currentIssueDate},{queue:false, duration:'_settings.datesSpeed'});
					$(_settings.datesDiv+' a.'+_settings.datesSelectedClass).removeClass(_settings.datesSelectedClass).parent().next().children().addClass(_settings.datesSelectedClass);
				}
			}

			// prev/next buttons now disappears on first/last issue | bugfix from 0.9.51: lower than 1 issue hide the arrows
			if(howManyDates == 1) {
				$(_settings.prevButton+','+_settings.nextButton).fadeOut('fast');
			} else if(howManyDates == 2) {
				if($(_settings.issuesDiv+' li:first-child').hasClass(_settings.issuesSelectedClass)) {
					$(_settings.prevButton).fadeOut('fast');
				 	$(_settings.nextButton).fadeIn('fast');
				} 
				else if($(_settings.issuesDiv+' li:last-child').hasClass(_settings.issuesSelectedClass)) {
					$(_settings.nextButton).fadeOut('fast');
					$(_settings.prevButton).fadeIn('fast');
				}
			} else {
				if( $(_settings.issuesDiv+' li:first-child').hasClass(_settings.issuesSelectedClass) ) {
					$(_settings.prevButton).fadeOut('fast');
				} 
				else if( $(_settings.issuesDiv+' li:last-child').hasClass(_settings.issuesSelectedClass) ) {
					$(_settings.nextButton).fadeOut('fast');
				}
				else {
					$(_settings.nextButton+','+_settings.prevButton).fadeIn('slow');
				}	
			}
		});

		$(_settings.prevButton).click(function(event){
			event.preventDefault();
			var currentPositionIssues = parseInt($(_settings.issuesDiv).css('marginLeft').substring(0,$(_settings.issuesDiv).css('marginLeft').indexOf('px')));
			var currentIssueIndex = currentPositionIssues/widthIssue;
			var currentPositionDates = parseInt($(_settings.datesDiv).css('marginLeft').substring(0,$(_settings.datesDiv).css('marginLeft').indexOf('px')));
			var currentIssueDate = currentPositionDates+widthDate;
			if(currentPositionIssues >= 0) {
				$(_settings.issuesDiv).stop();
				$(_settings.datesDiv+' li:first-child a').click();
			} else {
				if (!$(_settings.issuesDiv).is(':animated')) {
					$(_settings.issuesDiv).animate({'marginLeft':currentPositionIssues+widthIssue},{queue:false, duration:_settings.issuesSpeed});
					$(_settings.issuesDiv+' li').animate({'opacity':_settings.issuesTransparency},{queue:false, duration:_settings.issuesSpeed});
					$(_settings.issuesDiv+' li.'+_settings.issuesSelectedClass).removeClass(_settings.issuesSelectedClass).prev().fadeTo(_settings.issuesTransparencySpeed, 1).addClass(_settings.issuesSelectedClass);
					$(_settings.datesDiv).animate({'marginLeft':currentIssueDate},{queue:false, duration:'_settings.datesSpeed'});
					$(_settings.datesDiv+' a.'+_settings.datesSelectedClass).removeClass(_settings.datesSelectedClass).parent().prev().children().addClass(_settings.datesSelectedClass);
				}
			}

			// prev/next buttons now disappears on first/last issue | bugfix from 0.9.51: lower than 1 issue hide the arrows
			if(howManyDates == 1) {
				$(_settings.prevButton+','+_settings.nextButton).fadeOut('fast');
			} else if(howManyDates == 2) {
				if($(_settings.issuesDiv+' li:first-child').hasClass(_settings.issuesSelectedClass)) {
					$(_settings.prevButton).fadeOut('fast');
				 	$(_settings.nextButton).fadeIn('fast');
				} 
				else if($(_settings.issuesDiv+' li:last-child').hasClass(_settings.issuesSelectedClass)) {
					$(_settings.nextButton).fadeOut('fast');
					$(_settings.prevButton).fadeIn('fast');
				}
			} else {
				if( $(_settings.issuesDiv+' li:first-child').hasClass(_settings.issuesSelectedClass) ) {
					$(_settings.prevButton).fadeOut('fast');
				} 
				else if( $(_settings.issuesDiv+' li:last-child').hasClass(_settings.issuesSelectedClass) ) {
					$(_settings.nextButton).fadeOut('fast');
				}
				else {
					$(_settings.nextButton+','+_settings.prevButton).fadeIn('slow');
				}	
			}
		});
		// keyboard navigation, added since 0.9.1
		if(_settings.arrowKeys=='true') {
			$(document).keydown(function(event){
				if (event.keyCode == 39) { 
				   $(_settings.nextButton).click();
				}
				if (event.keyCode == 37) { 
				   $(_settings.prevButton).click();
				}
			});
		}
		
		if (_containerid != -1)
		{	//someone set containerid to valid number
			_settings.update(_containerid, 1);
		}
		// default position startAt, added since 0.9.3
		//$(settings.datesDiv+' li').eq(settings.startAt-1).find('a').trigger('click');
		// autoPlay, added since 0.9.4
		//if(settings.autoPlay == 'true') { 
		//	setInterval("autoPlay()", settings.autoPlayPause);
		//}
	})
};

// autoPlay, added since 0.9.4
/*
function autoPlay(){
	var currentDate = $(settings.datesDiv).find('a.'+settings.datesSelectedClass);
	if(settings.autoPlayDirection == 'forward') {
		if(currentDate.parent().is('li:last-child')) {
			$(settings.datesDiv+' li:first-child').find('a').trigger('click');
		} else {
			currentDate.parent().next().find('a').trigger('click');
		}
	} else if(settings.autoPlayDirection == 'backward') {
		if(currentDate.parent().is('li:first-child')) {
			$(settings.datesDiv+' li:last-child').find('a').trigger('click');
		} else {
			currentDate.parent().prev().find('a').trigger('click');
		}
	}
}
*/
function setContainer(_id, _call)
{
	//alert('' + _id);
	_containerid = _id;
	if (_settings)
		_settings.update(_id, _call);
}