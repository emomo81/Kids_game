export default {
  "name": "Friendship",
  "type": "object",
  "properties": {
    "from_email": {
      "type": "string",
      "description": "Email of the sender"
    },
    "to_email": {
      "type": "string",
      "description": "Email of the recipient"
    },
    "from_name": {
      "type": "string"
    },
    "to_name": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted"
      ],
      "default": "pending"
    }
  },
  "required": [
    "from_email",
    "to_email"
  ]
}