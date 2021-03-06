export default {
    definitions: {
        'user-settings': {
            type: 'object',
            properties: {
                microphone: {
                    type: 'integer',
                    default: 50
                },
                audio: {
                    type: 'integer',
                    default: 50
                },
                spatialAudioEnabled: {
                    type: 'string',
                    default: true
                }
            }
        },
        'user-settings_list': {
            type: 'array',
            items: { $ref: '#/definitions/user-settings'}
        }
    }
}