;; === defines ===

;; Song commands and flags
I_NOTE_C     = $00
I_NOTE_CS    = $01
I_NOTE_D     = $02
I_NOTE_DS    = $03
I_NOTE_E     = $04
I_NOTE_F     = $05
I_NOTE_FS    = $06
I_NOTE_G     = $07
I_NOTE_GS    = $08
I_NOTE_A     = $09
I_NOTE_AS    = $0a
I_NOTE_B     = $0b
I_NOTE_REST  = $0c
WITH_LEN_FLAG = $10
WITH_Q_FLAG   = $20
WORD_FLAG     = $40
I_PATTERN       = $80
I_LOOP_STR      = $81
I_LOOP_END      = $82
I_NLEN          = $83
I_WORD_NLEN     = $84
I_QLEN          = $85
I_WORD_QLEN     = $86
I_OCTAVE        = $87
I_OCT_INC       = $88
I_OCT_DEC       = $89
I_TRANSPOSE     = $8a
I_VOLUME        = $8b
I_VOL_INC       = $8c
I_VOL_DEC       = $8d
I_PITCH         = $8e
I_ADSR          = $8f
I_FILTER        = $90
I_WAVE          = $91
I_PW            = $92
I_WAVE_SEQ      = $93
I_PW_SEQ        = $94
I_NP_SEQ        = $95
I_PITCH_SEQ     = $96
I_ABS_PITCH_SEQ = $97
I_CUTOFF_SEQ    = $98
I_RES_SEQ       = $99

;; Token to indicate end of a song or sequence
I_EOF = $ff

;; Sequence commands and flags
I_SEQ_JUMP_MARKER = $00
I_SEQ_VALUE       = $02
I_SEQ_REPEAT      = $04
I_SEQ_LOOP        = $06
I_SEQ_WORD_FLAG   = %1000

;; Offsets to fields in sequence structure
;; e.g. pw_seq+SEQ_I --> pw_seq.i (if pw_seq were a C struct...)
SEQ_LO       =  0   ; low byte of base pointer
SEQ_HI       =  3   ; high byte of base pointer
SEQ_I        =  6   ; index
SEQ_JMP      =  9   ; jump marker index
SEQ_COUNTER  = 12   ; repeat/loop counter
SEQ_STEP     = 15   ; repeat step
SEQ_VALUE_LO = 18   ; repeat/loop value lo
SEQ_VALUE_HI = 21   ; repeat/loop value hi (word-only)

;; Zero-page global variables
ZP_TEMP    = $f8
ZP_PTR_LO  = $f9
ZP_PTR_HI  = $fa
ZP_CHANNEL = $fb
ZP_SEQ_LO  = $fc
ZP_SEQ_HI  = $fd
ZP_SEQ_I   = $fe

;; === code ===

init:
  rts   ; nothing to do!


play:
  ;; update SID registers first
  jsr update_sid_regs

  ;; play all channels
  ldx #0
  jsr play_channel

  ldx #1
  jsr play_channel

  ldx #2
  jsr play_channel

<% if (debug) { %>
  inc global_counter
  bne _skip_global_counter
  inc global_counter+1
_skip_global_counter:
<% } %>

  rts


update_sid_regs:
  ldx #2
  ldy #0
_upd_loop:
  lda sid_freq_lo, x
  sta $d400, y
  lda sid_freq_hi, x
  sta $d401, y
  lda sid_pw_lo, x
  sta $d402, y
  lda sid_pw_hi, x
  sta $d403, y
  lda sid_control, x
  sta $d404, y
  lda sid_ad, x
  sta $d405, y
  lda sid_sr, x
  sta $d406, y
  tya
  adc #7
  tay
  dex
  bpl _upd_loop

  lda sid_fc_lo
  sta $d415
  lda sid_fc_hi
  sta $d416
  lda sid_flt_res
  sta $d417
  lda sid_vol_mode
  sta $d418

  rts


play_channel:
  stx ZP_CHANNEL        ; save channel

  lda finished, x
  bne _done             ; branch if finished

  lda playing, x
  beq _fetch_loop       ; branch if not playing note

  ;; decrement quantization length counter
  ldy qlen_c_lo, x
  lda qlen_c_hi, x
  cpy #$01
  dey
  sbc #0
  sta ZP_TEMP
  tya
  sta qlen_c_lo, x
  lda ZP_TEMP
  sta qlen_c_hi, x
  bcs _dec_nlen_c       ; branches if qlen_c >= 0

  ;; gate off
  lda wave, x
  sta sid_control, x

_dec_nlen_c:
  ;; decrement note length counter
  ldy nlen_c_lo, x
  lda nlen_c_hi, x
  cpy #$01
  dey
  sbc #0
  sta ZP_TEMP
  tya
  sta nlen_c_lo, x
  lda ZP_TEMP
  sta nlen_c_hi, x
  bcc _stop_playing     ; branches if nlen_c < 0
  jmp _play_sequences

_stop_playing:
  ;; stop playing
  lda #0
  sta playing, x

_fetch_loop:
  jsr fetch_song_byte

  cmp #I_EOF
  bne _check_note       ; branch if cmd != I_EOF
  lda #1
  sta finished, x       ; mark channel as finished
  rts

_check_note:
  cmp #$80
  bcc _play_note        ; branch if cmd < $80

  ;; instruction is a command: use jump table
  jsr opcode_launcher

  lda #0
  beq _fetch_loop       ; keep fetching and decoding instructions
                        ; until a note is reached
_done:
  rts

_play_note:
  ldx ZP_CHANNEL

  ;; convert relative to absolute note, transpose it
  pha
  and #%00001111
  cmp #I_NOTE_REST
  beq _reload_counters

  ;; add octave
  clc
  adc octave_n, x
  adc transpose, x

  ;; load freq of new note
  tay
  lda freq_lo, y
  sta sid_freq_lo, x
  lda freq_hi, y
  sta sid_freq_hi, x

  ;; gate on
  ldy wave, x
  iny           ; enable gate
  tya
  sta sid_control, x

_reload_counters:
  pla
  and #%01110000
  sta ZP_TEMP

  cmp #WITH_LEN_FLAG
  beq _note_with_len

  ;; reload frame counters with default lengths
  lda nlen_lo, x
  sta nlen_c_lo, x
  lda nlen_hi, x
  sta nlen_c_hi, x
  jmp _reload_q_counters

_note_with_len:
  ;; reload note length counter with operand
  jsr fetch_song_byte
  sta nlen_c_lo, x
  lda ZP_TEMP
  and #WORD_FLAG
  beq _skip_len_hi
  jsr fetch_song_byte
_skip_len_hi:
  sta nlen_c_hi, x

_reload_q_counters:
  lda ZP_TEMP
  cmp #WITH_Q_FLAG
  beq _note_with_quant

  ;; reload quantization frame counters with defaults
  lda qlen_lo, x
  sta qlen_c_lo, x
  lda qlen_hi, x
  sta qlen_c_hi, x
  jmp _reset_sequence_indexes

_note_with_quant:
  ;; reload note length counter with operand
  jsr fetch_song_byte
  sta qlen_c_lo, x
  lda ZP_TEMP
  and #WORD_FLAG
  beq _skip_q_hi
  jsr fetch_song_byte
_skip_q_hi:
  sta qlen_c_hi, x

_reset_sequence_indexes:
  lda #0
  ;; TODO Do it for all sequences
  sta pw_seq + SEQ_I, x

  lda #1
  sta playing, x

_play_sequences:
  ;; TODO Do it for all sequences

  ;; ************************************************
  lda #<pw_seq
  sta ZP_PTR_LO
  lda #>pw_seq
  sta ZP_PTR_HI

  lda pw_seq + SEQ_LO, x
  sta ZP_SEQ_LO
  lda pw_seq + SEQ_HI, x
  sta ZP_SEQ_HI
  lda pw_seq + SEQ_I, x
  sta ZP_SEQ_I

  jsr play_sequence

  ldy seq_value_lo, x
  lda (ZP_PTR_LO), y
  sta sid_pw_lo, x

  ldy seq_value_hi, x
  lda (ZP_PTR_LO), y
  sta sid_pw_hi, x

  lda ZP_SEQ_I
  sta pw_seq + SEQ_I, x
  ;; ************************************************

  rts


fetch_song_byte:
  ; fetch value and store it
  lda song_ptr_lo, x
  sta ZP_PTR_LO
  lda song_ptr_hi, x
  sta ZP_PTR_HI
  ldy #0
  lda (ZP_PTR_LO), y
  pha

  ;; increment song_ptr
  lda song_ptr_hi, x
  ldy song_ptr_lo, x
  cpy #$ff
  iny
  adc #0
  pha
  tya
  sta song_ptr_lo, x
  pla
  sta song_ptr_hi, x

  pla
  rts


play_sequence:
  ldy seq_counter, x
  lda (ZP_PTR_LO), y
  beq _next_seq_byte          ; branch if counter is already 0

  tay
  dey                         ; decrement counter
  tya
  ldy seq_counter, x
  sta (ZP_PTR_LO), y          ; update counter field
  beq _next_seq_byte          ; if counter reaches 0, advance

  ldy seq_step, x
  lda (ZP_PTR_LO), y
  sta ZP_TEMP                 ; get step value
  bne _add_step_value
  rts

_add_step_value:
  ;; add step to sequence value
  ldy seq_value_lo, x
  lda (ZP_PTR_LO), y
  adc ZP_TEMP
  sta (ZP_PTR_LO), y

  ldy seq_value_hi, x
  lda (ZP_PTR_LO), y
  adc #0
  sta (ZP_PTR_LO), y
  rts

_next_seq_byte:
  jsr fetch_seq_byte
  cmp #I_EOF
  beq _play_seq_done

  jmp opcode_seq_launcher

_play_seq_done:
  ;; if jump marker is != $ff, set index to SEQ_JMP
  ldx ZP_CHANNEL
  ldy seq_jmp, x
  lda (ZP_PTR_LO), y          ; get jump marker index
  cmp #$ff
  beq _seq_done

  sta ZP_SEQ_I                ; use jump marker index as current index
  jmp _next_seq_byte

_seq_done:
  rts


fetch_seq_byte:
  ldy ZP_SEQ_I
  lda (ZP_SEQ_LO), y      ; get sequence byte with index
  cmp #I_EOF
  beq _fetch_seq_done     ; branch if sequence ended
  iny
  sty ZP_SEQ_I            ; increment index
_fetch_seq_done:
  rts

<%- include("songcmds.asm") %>
<%- include("seqcmds.asm") %>

;; === data ===

;; ghost registers by channel
sid_freq_lo:  .byte 0, 0, 0
sid_freq_hi:  .byte 0, 0, 0
sid_pw_lo:    .byte 0, 0, 0
sid_pw_hi:    .byte $8, $8, $8
sid_control:  .byte 0, 0, 0
sid_ad:       .byte $08, $70, $80
sid_sr:       .byte $40, $e1, $e1

;; ghost registers for all channels
sid_fc_lo:    .byte 0
sid_fc_hi:    .byte 0
sid_flt_res:  .byte 0
sid_vol_mode: .byte $0c

;; song pointers
song_ptr_lo: .byte <song_0, <song_1, <song_2
song_ptr_hi: .byte >song_0, >song_1, >song_2
playing:     .byte 0, 0, 0
finished:    .byte 0, 0, 0

;; more state vars
nlen_lo:   .byte 24, 24, 24
nlen_hi:   .byte 0, 0, 0
qlen_lo:   .byte 20, 20, 20
qlen_hi:   .byte 0, 0, 0
octave_n:  .byte 12*3, 12*3, 12*3
transpose: .byte 0, 0, 0
pitch:     .byte 0, 0, 0
wave:      .byte $40, $40, $40

;; counters
nlen_c_lo: .byte 0, 0, 0
nlen_c_hi: .byte 0, 0, 0
qlen_c_lo: .byte 0, 0, 0
qlen_c_hi: .byte 0, 0, 0

;; loop stacks (8 simultaneous loops max, per channel)
loops_idx:
  .byte $fd, $fe, $ff
loops_ptr_lo:
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
loops_ptr_hi:
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
loops_c:
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0

pw_seq:     ; word sequence
  .byte <eof, <eof, <eof
  .byte >eof, >eof, >eof
  .byte 0, 0, 0
  .byte $ff, $ff, $ff
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0
  .byte 0, 0, 0

<% if (debug) { %>
global_counter: .word 0
<% } %>

;; === rodata ===

;; Note offsets for each octave
octave_n_tbl:
  .byte 0, 12, 24, 36, 48, 60, 72, 84

;; offsets for accessing fields in sequence structure with Y-indirection
seq_lo:       .byte 0, 1, 2
seq_hi:       .byte 3, 4, 5
seq_i:        .byte 6, 7, 8
seq_jmp:      .byte 9, 10, 11
seq_counter:  .byte 12, 13, 14
seq_step:     .byte 15, 16, 17
seq_value_lo: .byte 18, 19, 20
seq_value_hi: .byte 21, 22, 23

eof: .byte I_EOF

;; Frequency table
<%- include("pal_freq.asm") %>

;; Notes/commands tables
;;
;; See I_ labels above
;;
;song_0: .byte $ff
;song_1: .byte $ff
;song_2: .byte $ff
