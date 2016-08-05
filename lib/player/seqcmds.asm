opc_seq_jump_marker:
  ldy seq_jmp, x
  lda ZP_SEQ_I
  sta (ZP_PTR_LO), y    ; store current index as jump marker
  rts

opc_seq_value:
  jsr fetch_seq_op_byte    ; op1 val
  ldy seq_value_lo, x
  sta (ZP_PTR_LO), y
  rts

opc_seq_repeat:
  jsr fetch_seq_op_byte    ; op1 val
  ldy seq_value_lo, x
  sta (ZP_PTR_LO), y       ; store low byte of value

  jsr fetch_seq_op_byte    ; op2 times
  ldy seq_counter, x
  sta (ZP_PTR_LO), y       ; store counter

  rts

opc_seq_loop:
  jsr fetch_seq_op_byte    ; op1 val
  ldy seq_value_lo, x
  sta (ZP_PTR_LO), y       ; store low byte of value

  jsr fetch_seq_op_byte    ; op2 times
  ldy seq_counter, x
  sta (ZP_PTR_LO), y       ; store counter

  jsr fetch_seq_op_byte    ; op3 step
  ldy seq_step, x
  sta (ZP_PTR_LO), y       ; store step

  rts

opc_seq_word_value:
  jsr fetch_seq_op_byte    ; op1 val (lo)
  ldy seq_value_lo, x
  sta (ZP_PTR_LO), y

  jsr fetch_seq_op_byte    ; op1 val (hi)
  ldy seq_value_hi, x
  sta (ZP_PTR_LO), y

  rts

opc_seq_word_repeat:
  jsr fetch_seq_op_byte    ; op1 val (lo)
  ldy seq_value_lo, x
  sta (ZP_PTR_LO), y       ; store low byte of value

  jsr fetch_seq_op_byte    ; op1 val (hi)
  ldy seq_value_hi, x
  sta (ZP_PTR_LO), y       ; store high byte of value

  jsr fetch_seq_op_byte    ; op2 times
  ldy seq_counter, x
  sta (ZP_PTR_LO), y       ; start counting

  rts

opc_seq_word_loop:
  jsr fetch_seq_op_byte    ; op1 val (lo)
  ldy seq_value_lo, x
  sta (ZP_PTR_LO), y       ; store low byte of value

  jsr fetch_seq_op_byte    ; op1 val (hi)
  ldy seq_value_hi, x
  sta (ZP_PTR_LO), y       ; store high byte of value

  jsr fetch_seq_op_byte    ; op2 times
  ldy seq_counter, x
  sta (ZP_PTR_LO), y       ; store counter

  jsr fetch_seq_op_byte    ; op3 step
  ldy seq_step, x
  sta (ZP_PTR_LO), y       ; store step

  rts


;; RTS jump table launcher for Sequence commands
opcode_seq_launcher:
  and #%00001110     ; Keep bits #1-#4 only, use as index on opcode_seq table
  tay
  lda opcode_seq_rts_tbl+1, y
  pha
  lda opcode_seq_rts_tbl, y
  pha
  rts

opcode_seq_rts_tbl:
  .word opc_seq_jump_marker-1
  .word opc_seq_value-1
  .word opc_seq_repeat-1
  .word opc_seq_loop-1
  .word opc_seq_jump_marker-1   ; duplicate
  .word opc_seq_word_value-1
  .word opc_seq_word_repeat-1
  .word opc_seq_word_loop-1

fetch_seq_op_byte:
  ldy ZP_SEQ_I
  lda (ZP_SEQ_LO), y      ; get sequence byte with index
  iny
  sty ZP_SEQ_I            ; increment index
  rts
