export default {
    definitions: {
        'instance-provision': {
            type: 'object',
            properties: {
                
            }
        }, 
        'instance-provision_list': {
            type: 'array',
            items: { $ref: '#/definitions/instance-provision'}
        }
    }
}