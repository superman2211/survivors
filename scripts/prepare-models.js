function generateModels(files) {
	files.push({ name: 'model_cube', generateCube()});
}

exports.generateModels = generateModels;