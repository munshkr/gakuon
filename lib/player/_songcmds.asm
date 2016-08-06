opc_pat_seq:
  ; TODO
  jsr fetch_song_byte   ; get op 1 (lo)
  jsr fetch_song_byte   ; get op 2 (hi)
  rts

opc_loop_start:
  lda loops_idx, x
  clc
  adc #3
  sta loops_idx, x

  sta ZP_TEMP
  jsr fetch_song_byte   ; get op 1 (times)
  ldy ZP_TEMP
  sta loops_c, y

  lda song_ptr_lo, x
  sta loops_ptr_lo, y
  lda song_ptr_hi, x
  sta loops_ptr_hi, y

  rts

opc_loop_end:
  ldy loops_idx, x

  lda loops_c, y
  sec
  sbc #1
  sta loops_c, y
  beq _loop_ended

  lda loops_ptr_lo, y
  sta song_ptr_lo, x
  lda loops_ptr_hi, y
  sta song_ptr_hi, x
  rts
_loop_ended:
  tya
  sec
  sbc #3
  sta loops_idx, x
  rts

opc_nlen:
  jsr fetch_song_byte   ; get op 1
  sta nlen_lo, x
  lda #0
  sta nlen_hi, x
  rts

opc_word_nlen:
  jsr fetch_song_byte   ; get op 1 lo
  sta nlen_lo, x
  jsr fetch_song_byte   ; get op 2 hi
  sta nlen_hi, x
  rts

opc_qlen:
  jsr fetch_song_byte   ; get op 1
  sta qlen_lo, x
  lda #0
  sta qlen_hi, x
  rts

opc_word_qlen:
  jsr fetch_song_byte   ; get op 1 lo
  sta qlen_lo, x
  jsr fetch_song_byte   ; get op 2 hi
  sta qlen_hi, x
  rts

opc_octave:
  jsr fetch_song_byte   ; get op 1
  tay
  lda octave_n_tbl, y
  sta octave_n, x
  rts

opc_oct_inc:
  lda octave_n, x
  clc
  adc #12
  sta octave_n, x
  rts

opc_oct_dec:
  lda octave_n, x
  sec
  sbc #12
  sta octave_n, x
  rts

opc_transpose:
  jsr fetch_song_byte   ; get op 1
  sta ZP_TEMP
  lda transpose, x
  clc
  adc ZP_TEMP
  sta transpose, x
  rts

opc_volume:
  jsr fetch_song_byte   ; get op 1
  sta ZP_TEMP
  lda sid_vol_mode, x
  and #%11110000
  clc
  adc ZP_TEMP
  sta sid_vol_mode, x
  rts

opc_inc_vol:
  lda sid_vol_mode, x
  and #%00001111
  tay
  iny
  cpy #%00010000          ; if it overflows, do nothing
  beq _opc_inc_vol_done
  tya
  sta ZP_TEMP
  lda sid_vol_mode, x
  and #%11110000
  clc
  adc ZP_TEMP
  sta sid_vol_mode, x
_opc_inc_vol_done:
  rts

opc_dec_vol:
  lda sid_vol_mode, x
  and #%00001111
  tay
  dey
  cpy #$ff                ; if it underflows, do nothing
  beq _opc_dec_vol_done
  tya
  sta ZP_TEMP
  lda sid_vol_mode, x
  and #%11110000
  clc
  adc ZP_TEMP
  sta sid_vol_mode, x
_opc_dec_vol_done:
  rts

opc_pitch:
  ; TODO
  jsr fetch_song_byte   ; get op 1
  rts

opc_adsr:
  jsr fetch_song_byte   ; get op 1 (ad)
  sta sid_ad, x
  jsr fetch_song_byte   ; get op 2 (sr)
  sta sid_sr, x
  rts

; TODO Test!
opc_filter:
  ;; set mode
  jsr fetch_song_byte   ; get op 1
  asl
  asl
  asl
  asl
  sta ZP_TEMP
  lda sid_vol_mode, x
  and #%00001111
  clc
  adc ZP_TEMP
  sta sid_vol_mode, x

  ;; enable filter on current channel
  txa
  tay
  iny
  lda #$80
_opc_filter_loop:
  rol
  dey
  bne _opc_filter_loop
_opc_filter_done:
  sta ZP_TEMP
  lda sid_flt_res, x
  ora ZP_TEMP
  sta sid_flt_res, x
  rts

opc_wave:
  jsr fetch_song_byte   ; get op 1
  sta wave, x
  rts

opc_pw:
  ; TODO
  jsr fetch_song_byte   ; get op 1 (lo)
  jsr fetch_song_byte   ; get op 1 (hi)
  rts

opc_wave_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  ;sta wave_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  ;sta wave_seq + SEQ_HI, x
  ;lda #$ff
  ;sta wave_seq + SEQ_JMP, x
  rts

opc_pw_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  sta pw_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  sta pw_seq + SEQ_HI, x
  lda #$ff
  sta pw_seq + SEQ_JMP, x
  rts

opc_np_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  ;sta np_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  ;sta np_seq + SEQ_HI, x
  ;lda #$ff
  ;sta np_seq + SEQ_JMP, x
  rts

opc_pitch_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  ;sta pitch_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  ;sta pitch_seq + SEQ_HI, x
  ;lda #$ff
  ;sta pitch_seq + SEQ_JMP, x
  rts

opc_abs_pitch_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  ;sta abs_pitch_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  ;sta abs_pitch_seq + SEQ_HI, x
  ;lda #$ff
  ;sta abs_pitch_seq + SEQ_JMP, x
  rts

opc_cutoff_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  ;sta cutoff_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  ;sta cutoff_seq + SEQ_HI, x
  ;lda #$ff
  ;sta cutoff_seq + SEQ_JMP, x
  rts

opc_res_seq:
  jsr fetch_song_byte   ; get op 1 (lo)
  ;sta res_seq + SEQ_LO, x
  jsr fetch_song_byte   ; get op 2 (hi)
  ;sta res_seq + SEQ_HI, x
  ;lda #$ff
  ;sta res_seq + SEQ_JMP, x
  rts


;; RTS jump table launcher for Song commands
opcode_launcher:
  asl
  tay
  lda opcode_rts_tbl+1, y
  pha
  lda opcode_rts_tbl, y
  pha
  rts

opcode_rts_tbl:
  .word opc_pat_seq-1
  .word opc_loop_start-1
  .word opc_loop_end-1
  .word opc_nlen-1
  .word opc_word_nlen-1
  .word opc_qlen-1
  .word opc_word_qlen-1
  .word opc_octave-1
  .word opc_oct_inc-1
  .word opc_oct_dec-1
  .word opc_transpose-1
  .word opc_volume-1
  .word opc_inc_vol-1
  .word opc_dec_vol-1
  .word opc_pitch-1
  .word opc_adsr-1
  .word opc_filter-1
  .word opc_wave-1
  .word opc_pw-1
  .word opc_wave_seq-1
  .word opc_pw_seq-1
  .word opc_np_seq-1
  .word opc_pitch_seq-1
  .word opc_abs_pitch_seq-1
  .word opc_cutoff_seq-1
  .word opc_res_seq-1
