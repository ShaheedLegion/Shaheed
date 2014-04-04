chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('chatmium.html', {
          id: "chatWinID",
		  maxHeight: 440, minHeight: 440, minWidth: 400,
    bounds: {
      height: 440,
      width: 400,
      top: 0
    },
    frame: 'none'
  });
});