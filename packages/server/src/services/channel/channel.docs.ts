export default {
    definitions: {
        channel: {
            type: 'object',
            properties: {

            }
        },
        channel_list: {
            type: 'array',
            items: { $ref: '#/definitions/channel'}
        }
    }
}