export default {
  "name": "FriendChallenge",
  "type": "object",
  "properties": {
    "from_email": {
      "type": "string"
    },
    "from_name": {
      "type": "string"
    },
    "to_email": {
      "type": "string"
    },
    "to_name": {
      "type": "string"
    },
    "operations": {
      "type": "string",
      "description": "e.g. '+-\u00d7'"
    },
    "min_num": {
      "type": "number",
      "default": 1
    },
    "max_num": {
      "type": "number",
      "default": 10
    },
    "num_problems": {
      "type": "number",
      "default": 5
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted",
        "completed"
      ],
      "default": "pending"
    },
    "challenger_score": {
      "type": "number",
      "default": 0
    },
    "opponent_score": {
      "type": "number",
      "default": 0
    },
    "winner_name": {
      "type": "string"
    }
  },
  "required": [
    "from_email",
    "to_email",
    "operations"
  ]
}