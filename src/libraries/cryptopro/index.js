'use strict';

// include libraries
require('../libraries/common/index');

// main class
class WebSignCryptoPro
{
	// certificate list.
	#certificates = new Map();
	#common = new WebSignCommon();

	certificateAddedCallbacks = new Set();
	certificateRemovedCallbacks = new Set();
	errorCallbacks = new Set();
	signCallbacks = new Set();

	constructor()
	{
	}

	SignHash(certificateId, hashAsHex)
	{
		// save result
		this.signCallbacks.forEach(function (v) { v("Signature"); });
	}
}
