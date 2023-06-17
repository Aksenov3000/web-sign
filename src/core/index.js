'use strict';

// include libraries
require('../libraries/cryptopro/index');
require('../libraries/rutoken/index');

// main class
function WebSign() {
	
	// certificate list. public property
  this.certificates = [];

	// library events. private property
  var libraryEvents = [];

	// library instaces. private property
  var libraryInstances = [];

	// closure - pointer to current instance of class. private property
  var self = this;
  
  // class constructor code
  
  // register libraries
  libraryInstances.push(new WebSignCryptoPro());
  libraryInstances.push(new WebSignRutoken());

	// private function
  function onReady() {
  }

	// public function
  this.run = function() {
  };
}
