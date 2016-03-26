"use strict";
const jsonexport = require('jsonexport')
const fs = require('fs')

let xmlData = `<school id="100"><grade id="1"><classroom id="101" name="Mrs. Jones' Math Class"><teacher id="10100000001" first_name="Barbara" last_name="Jones"/><student id="10100000010" first_name="Michael" last_name="Gil"/><student id="10100000011" first_name="Kimberly" last_name="Gutierrez"/><student id="10100000013" first_name="Toby" last_name="Mercado"/><student id="10100000014" first_name="Lizzie" last_name="Garcia"/><student id="10100000015" first_name="Alex" last_name="Cruz"/></classroom><classroom id="102" name="Mr. Smith's PhysEd Class"><teacher id="10200000001" first_name="Arthur" last_name="Smith"/><teacher id="10200000011" first_name="John" last_name="Patterson"/><student id="10200000010" first_name="Nathaniel" last_name="Smith"/><student id="10200000011" first_name="Brandon" last_name="McCrancy"/><student id="10200000012" first_name="Elizabeth" last_name="Marco"/><student id="10200000013" first_name="Erica" last_name="Lanni"/><student id="10200000014" first_name="Michael" last_name="Flores"/><student id="10200000015" first_name="Jasmin" last_name="Hill"/><student id="10200000016" first_name="Brittany" last_name="Perez"/><student id="10200000017" first_name="William" last_name="Hiram"/><student id="10200000018" first_name="Alexis" last_name="Reginald"/><student id="10200000019" first_name="Matthew" last_name="Gayle"/></classroom><classroom id="103" name="Brian's Homeroom"><teacher id="10300000001" first_name="Brian" last_name="O'Donnell"/></classroom></grade</school>`
let cleanedDataArray = []


const cleanXml = (data) => {


  let makeObject = data.match(/<\s*([^\s>]+)([^>]*)\/\s*>/g);
  for(var i = 0; i < makeObject.length; i++) {
    let arrayOfTagData = []
    let initialTag = makeObject[i].substring(0, makeObject[i].length - 2) + ">";
    let tagName = initialTag.match(/[^<][\w+$]+/)[0]
    let tagAttributes = initialTag.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);
    for(var n = 0; n < tagAttributes.length; n++){
      let attribute = tagAttributes[n];
      let attributeName = attribute.substring(0, attribute.indexOf('='));
      let attributeValue = attribute.substring(attribute.indexOf('"') + 1, attribute.lastIndexOf('"') + 1);
      let objectKey = tagName + "_" + attributeName
      let object = {}
      object[objectKey] = attributeValue;
      arrayOfTagData.push(object)
    }
    cleanedDataArray.push(arrayOfTagData)
  }
  console.log(cleanedDataArray)
}

const fixTagsOf = (data) => {
  data = cleanXml(data)

  return data
}


const cleanThe = (data) => {
  data = data.replace(/\<\?xml.+\?\>|\<\!DOCTYPE.+]\>/g, "")
    .replace(/\t\r\n/g, "")
    .replace(/\s+</g, "<")
    .replace(/>\s+/g, ">");

  data = fixTagsOf(data)

  return data
}


const convertXml = (data) => {
  data = cleanThe(data)
  // console.log(data)
  return data
};






jsonexport(convertXml(xmlData), {rowDelimeter: ','}, (err, csv) => {
  console.log("nothing Broken")
})
