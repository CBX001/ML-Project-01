$("#image-selector").change(function () {
    let reader = new FileReader();

    reader.onload = function () {
        let dataURL = reader.result;
        $("#selected-image").attr("src", dataURL);
        $("#prediction-list").empty();
    }
    let file = $("#image-selector").prop('files')[0];
    reader.readAsDataURL(file);
});

// Select Classification Model
$("#model-selector").change(function () {
    loadModel($("#model-selector").val());
    $(".progress-bar").show();
})

// Load Image and Define model, display then hide progress bar when once completed
let model;
async function loadModel(name) {
    console.log(`Loading the ${name} Model...`)
    model = await tf.loadLayersModel(`../tfjs-models/${name}/model.json`);
    console.log(`${name} Model was successfully loaded!`)
    $('.progress-bar').hide();
}


// Perform Prediction after preprocessing the image
$("#predict-button").click(async function () {
    let image = $('#selected-image').get(0);
    let tensor = preprocessImage(image, $("#model-selector").val());

    let prediction = await model.predict(tensor).data();
    let top5 = Array.from(prediction)
        .map(function (p, i) {
            return {
                probability: p,
                className: IMAGENET_CLASSES[i]
            };
        }).sort(function (a, b) {
            return b.probability - a.probability;
        }).slice(0, 5);

    $("#prediction-list").empty();
    top5.forEach(function (p) {
        $("#prediction-list").append(`<li>${p.className} - ${(100*p.probability.toFixed(6)).toFixed(3)}%</li>`);
    });

});


// Image Preprocessing Function
function preprocessImage(image, modelName) {
    let tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([224, 224])
        .toFloat(); //.sub(meanImageNetRGB)
    if (modelName == undefined) {
        return tensor.expandDims();
    } else if (modelName == "ResNet50") {
        let meanImageNetRGB = tf.tensor1d([123.68, 116.779, 103.939]);
        return tensor.sub(meanImageNetRGB)
            .reverse(2)
            .expandDims();
    } else if (modelName == "VGG16") {
        let meanImageNetRGB = tf.tensor1d([123.68, 116.779, 103.939]);
        return tensor.sub(meanImageNetRGB)
            .reverse(2)
            .expandDims();
    } else if (modelName == "MobileNet") {
        let offset = tf.scalar(127.5);
        return tensor.sub(offset)
            .div(offset)
            .expandDims();
    } else {
        throw new Error("UnKnown Model error");
    }
}