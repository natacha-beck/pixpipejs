/*
* Author    Jonathan Lurie - http://me.jonahanlurie.fr
*
* License   MIT
* Link      https://github.com/jonathanlurie/pixpipejs
* Lab       MCIN - Montreal Neurological Institute
*/

import pako from 'pako';
import FileSaver from 'file-saver';
import { Filter } from '../core/Filter.js';
import { Image2D } from '../core/Image2D.js';
import { Image3D } from '../core/Image3D.js';


/**
* A PixpDecoder instance decodes a *.pixp file and output an Image2D or Image3D.
* The input, specified by `.addInput(...)` must be an ArrayBuffer
* (from an `UrlToArrayBufferFilter`, an `UrlToArrayBufferReader` or anothrer source ).
*
* **Usage**
* - [examples/pixpFileToImage2D.html](../examples/pixpFileToImage2D.html)
*/
class PixpDecoder extends Filter {
  constructor(){
    super();
    this.addInputValidator(0, ArrayBuffer);
  }


  _run(){

    console.log(this._input);

    if(! this.hasValidInput() ){
      console.warn("PixpDecoder can only decode ArrayBuffer.");
      return;
    }

    var input = this._getInput();

    //var pixpString2 = pako.inflate(input /*, { to: 'string' }*/);
    //var pixpObject = JSON.parse( pixpString2 );

    var inflator = new pako.Inflate({
      level: 6,
      to: 'string'
    });

    inflator.push( input, true );

    // quit if not a gz file
    if( inflator.err ){
      console.warn("This file is not a Pixp file.");
      return;
    }
    
    var pixpObject = null;

    try{
      pixpObject = JSON.parse( inflator.result );
    }catch(e){
      console.warn("Could not parse pixp file.");
      console.error(e);
      return;
    }

    if( ! (pixpObject.pixpipeType in pixpipe)){
      console.warn("Unknown type pixpipe." + pixpObject.pixpipeType + ", cannot create any output." );
      return;
    }

    var constructorHost = (window || this);
    if(! constructorHost[ pixpObject.dataType ]){
      console.warn( "Data array from pixp file is unknown: " + pixpObject.dataType );
      return;
    }

    var outputRawData = new constructorHost[ pixpObject.dataType ]( pixpObject.data );
    var output = new pixpipe[ pixpObject.pixpipeType ];
    output.setRawData( outputRawData );
    output.setRawMetadata( pixpObject.metadata );

    this._output[0] = output;

  }



} /* END of class PixpDecoder */

export { PixpDecoder }
