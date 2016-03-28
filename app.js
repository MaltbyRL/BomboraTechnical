"use strict";
const jsonexport = require("jsonexport")
const path = require('path');
const fs = require("fs")
const files = fs.readdirSync("./xml-to-be-converted");




const consolidateStudentObjects = (data) => {
  let arrayOfFullStudentObjects = [];
  let school, grade, classroom, teacherOne, teacherTwo;
  let studentObject = {};
  let counter = 0;
  let addTeacher = true;

  data.forEach(function(object, i) {
    if (object.hasOwnProperty("school_id")) {
      school = {
        school_id: object["school_id"]
      }
    } else if (object.hasOwnProperty("grade_id")) {
      grade = {
        grade_id: object["grade_id"]
      }
    } else if (object.hasOwnProperty("classroom_id")) {
      addTeacher = true;
      classroom = {
        classroom_id: object["classroom_id"],
        classroom_name: object["classroom_name"]
      }
    } else if (object.hasOwnProperty("teacher_id")) {
      if (addTeacher) {
        counter++
        teacherOne = {
          teacher_id: object["teacher_id"],
          teacher_first_name: object["teacher_first_name"],
          teacher_last_name: object["teacher_last_name"]
        }
        teacherTwo = {
          teacher_2_id: "x___",
          teacher_2_first_name: "x___",
          teacher_2_last_name: "x___"
        }
        addTeacher = false;
      } else {
        teacherTwo = {
          teacher_2_id: object["teacher_id"],
          teacher_2_first_name: object["teacher_first_name"],
          teacher_2_last_name: object["teacher_last_name"]
        }
      }
    }
      if (object.hasOwnProperty("student_id") || counter === 3) {
        studentObject = {
          grade_id: grade["grade_id"],
          classroom_id: classroom["classroom_id"],
          classroom_name: classroom["classroom_name"],
          teacher_2_id: teacherTwo["teacher_2_id"],
          teacher_2_first_name: teacherTwo["teacher_2_first_name"],
          teacher_2_last_name: teacherTwo["teacher_2_last_name"],
          teacher_id: teacherOne["teacher_id"],
          teacher_first_name: teacherOne["teacher_first_name"],
          teacher_last_name: (teacherOne["teacher_last_name"] !== '"') ? teacherOne["teacher_last_name"] : "x___",
          school_id: school["school_id"],
          student_id: object["student_id"],
          student_first_name: object["student_first_name"],
          student_last_name: object["student_last_name"]
        }
        console.log(">>>", studentObject)
        arrayOfFullStudentObjects.push(studentObject)
      }
  })
  return arrayOfFullStudentObjects
}


// Input: [ [ { school_id: '100"' } ],[ { grade_id: '1"' } ], [ { classroom_id: '101"' },{ classroom_name: 'Mrs_Jones_Math Class"' } ]]
// Output: [ { school_id: '100"' }, { grade_id: '1"' }, { classroom_id: '101"', classroom_name: 'Mrs_Jones_Math Class"' }]
const flattenArrayOfObjects = (data) => {
  let unnestedArray = []
  data.map(function(data) {
    if (Array.isArray(data)) {
      unnestedArray = unnestedArray.concat(flatten(data));
    } else {
      unnestedArray.push(data);
    }
  })
  return unnestedArray
}

// Input:
// Output:
const organizeArrayObject = (data) => {
  let arrayOfObjects = []
  data.forEach(function(part) {
    let buildObject = {}
    part.forEach(function(object) {
      let objectKey = Object.keys(object)[0]
      let objectValue = object[objectKey]
      buildObject[objectKey] = objectValue
    })
    arrayOfObjects.push(buildObject)
  })
  return arrayOfObjects
}

// Input: <school id="100"/><grade id="1"/><classroom id="101" name="Mrs_Jones_Math Class"/><teacher id="10100000001" first_name="Barbara" last_name="Jones"/>
// Output: [ [ { school_id: '100"' } ], [ { grade_id: '1"' } ], [ { classroom_id: '101"' }, { classroom_name: 'Mrs_Jones_Math Class"' } ]]
const cleanXml = (data) => {
  let cleanedDataArray = []
  let makeObject = data.match(/<[a-zA-Z]+((.(?!<\/)(?!<[a-zA-Z]+))*)?>/g);
  for (var i = 0; i < makeObject.length; i++) {
    let arrayOfTagData = []
    let initialTag = makeObject[i].substring(0, makeObject[i].length - 2) + ">";
    let tagName = initialTag.match(/[^<][\w+$]+/)[0]
    let tagAttributes = initialTag.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);
    for (var n = 0; n < tagAttributes.length; n++) {
      let attribute = tagAttributes[n];
      let attributeName = attribute.substring(0, attribute.indexOf('='));
      let attributeValue = attribute.substring(attribute.indexOf('"'), attribute.lastIndexOf('"') + 1);
      let objectKey = tagName + "_" + attributeName
      let object = {}
      object[objectKey] = attributeValue;
      arrayOfTagData.push(object)
    }
    cleanedDataArray.push(arrayOfTagData)
  }
  return cleanedDataArray
}

// Removes Doctype, ensures no edge cases in strings.
// Outputs uniform data to easily work with.
const removeEdgeCases = (data) => {

  data = data.replace(/('s\s)/g, "s_")
    .replace(/\<\?xml.+\?\>|\<\!DOCTYPE.+]\>/g, "")
    .replace(/\.\s/g, "_")
    .replace(/\t\r\n/g, "")
    .replace(/\'\s\M/g, "_M")
    .replace(/\s+</g, "<")
    .replace(/\"\>/g, '"/>')
    .replace(/>\s+/g, ">")
  return data
}

// Runs data through necessary steps.
const convertXml = (data) => {
  data = removeEdgeCases(data)
  data = cleanXml(data)
  data = organizeArrayObject(data)
  data = flattenArrayOfObjects(data)
  data = consolidateStudentObjects(data)
  return data
}

for (var i in files) {
  if (path.extname(files[i]) === ".xml") {
    let xmlFile = "./xml-to-be-converted/" + files[i]
    fs.readFile(xmlFile, function read(err, data) {
      if (err) {
        console.log("err", err)
        throw err;
      }
      let xmlData = data.toString('utf8');
      jsonexport(convertXml(xmlData), (err, csv) => {
        if (err) console.log("err:", err)
        console.log(csv)
        fs.writeFile("converted-to-csv/Richard.csv", csv, function(err, file) {
          console.log(err, file);
        });
        console.log("nothing Broken")
      })
    });

  }
}
