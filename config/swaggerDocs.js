const swaggerJsDoc = require('swagger-jsdoc');

const APP_PORT = process.env.APP_PORT || 5000;
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'C-V2X API',
			version: '1.0.0',
			description: 'C-V2X API documents',
		},
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				BearerAuth: [],
			},
		],
		servers: [
			{
				url: `http://localhost:${APP_PORT}`,
			},
		],
	},
	apis: ['./routes/*.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);
