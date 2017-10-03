meta:
  id: elmi
  file-extension: elmi
  title: Elm Language Interface
  endian: be
seq:
  - id: package_info
    type: package_info
  - id: import_count
    type: u8
  - id: imports
    type: import
    repeat: expr
    repeat-expr: import_count
types:
  package_info:
    seq:
      - id: version
        type: package_version
      - id: name
        type: package_id
  package_version:
    seq:
      - id: major
        type: u8
      - id: minor
        type: u8
      - id: patch
        type: u8
  package_id:
    seq:
      - id: author_username
        type: str_with_len
      - id: package_name
        type: str_with_len
  import:
    seq:
      - id: import_type
        type: u1
      - id: import_name
        type: str_with_len
      - id: path
        if: import_type == 2
        type: import_path
      # - id: import_body
      #   type:
      #     switch-on: import_type
      #     cases:
      #       0: just_import
      #       1: just_import
      #       2: import_with_path
  import_path:
    seq:
      - id: path_len
        type: u8
      - id: path_chunks
        type: str_with_len
        repeat: expr
        repeat-expr: path_len
      - id: path_reserver
        type: u1
  str_with_len:
    seq:
      - id: len
        type: u8
      - id: value
        type: str
        encoding: UTF-8
        size: len

