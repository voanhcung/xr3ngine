export default {
    definitions: {
        'group-user-rank': {
            type: 'object',
            required: ['rank'],
            properties: {
                rank: {
                    type: 'string'
                }
            }
        },
        'group-user-rank_list': {
            type: 'array',
            items: { $ref: '#/definitions/group-user-rank'}
        }
    }
}