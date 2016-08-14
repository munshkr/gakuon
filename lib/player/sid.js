var templates = {
"_songcmds.asm": function(data) {
var include = function include(includePath, includedData) {
  return templates[includePath](includedData);
};
var fn = function anonymous(locals, escape, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, filename, lineno){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escape = escape || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = "opc_pat_seq:\n  ; TODO\n  jsr fetch_song_byte   ; get op 1 (lo)\n  jsr fetch_song_byte   ; get op 2 (hi)\n  rts\n\nopc_loop_start:\n  lda loops_idx, x\n  clc\n  adc #3\n  sta loops_idx, x\n\n  sta ZP_TEMP\n  jsr fetch_song_byte   ; get op 1 (times)\n  ldy ZP_TEMP\n  sta loops_c, y\n\n  lda song_ptr_lo, x\n  sta loops_ptr_lo, y\n  lda song_ptr_hi, x\n  sta loops_ptr_hi, y\n\n  rts\n\nopc_loop_end:\n  ldy loops_idx, x\n\n  lda loops_c, y\n  sec\n  sbc #1\n  sta loops_c, y\n  beq _loop_ended\n\n  lda loops_ptr_lo, y\n  sta song_ptr_lo, x\n  lda loops_ptr_hi, y\n  sta song_ptr_hi, x\n  rts\n_loop_ended:\n  tya\n  sec\n  sbc #3\n  sta loops_idx, x\n  rts\n\nopc_nlen:\n  jsr fetch_song_byte   ; get op 1\n  sta nlen_lo, x\n  lda #0\n  sta nlen_hi, x\n  rts\n\nopc_word_nlen:\n  jsr fetch_song_byte   ; get op 1 lo\n  sta nlen_lo, x\n  jsr fetch_song_byte   ; get op 2 hi\n  sta nlen_hi, x\n  rts\n\nopc_qlen:\n  jsr fetch_song_byte   ; get op 1\n  sta qlen_lo, x\n  lda #0\n  sta qlen_hi, x\n  rts\n\nopc_word_qlen:\n  jsr fetch_song_byte   ; get op 1 lo\n  sta qlen_lo, x\n  jsr fetch_song_byte   ; get op 2 hi\n  sta qlen_hi, x\n  rts\n\nopc_octave:\n  jsr fetch_song_byte   ; get op 1\n  tay\n  lda octave_n_tbl, y\n  sta octave_n, x\n  rts\n\nopc_oct_inc:\n  lda octave_n, x\n  clc\n  adc #12\n  sta octave_n, x\n  rts\n\nopc_oct_dec:\n  lda octave_n, x\n  sec\n  sbc #12\n  sta octave_n, x\n  rts\n\nopc_transpose:\n  jsr fetch_song_byte   ; get op 1\n  sta ZP_TEMP\n  lda transpose, x\n  clc\n  adc ZP_TEMP\n  sta transpose, x\n  rts\n\nopc_volume:\n  jsr fetch_song_byte   ; get op 1\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%11110000\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n  rts\n\nopc_inc_vol:\n  lda sid_vol_mode, x\n  and #%00001111\n  tay\n  iny\n  cpy #%00010000          ; if it overflows, do nothing\n  beq _opc_inc_vol_done\n  tya\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%11110000\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n_opc_inc_vol_done:\n  rts\n\nopc_dec_vol:\n  lda sid_vol_mode, x\n  and #%00001111\n  tay\n  dey\n  cpy #$ff                ; if it underflows, do nothing\n  beq _opc_dec_vol_done\n  tya\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%11110000\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n_opc_dec_vol_done:\n  rts\n\nopc_pitch:\n  ; TODO\n  jsr fetch_song_byte   ; get op 1\n  rts\n\nopc_adsr:\n  jsr fetch_song_byte   ; get op 1 (ad)\n  sta sid_ad, x\n  jsr fetch_song_byte   ; get op 2 (sr)\n  sta sid_sr, x\n  rts\n\n; TODO Test!\nopc_filter:\n  ;; set mode\n  jsr fetch_song_byte   ; get op 1\n  asl\n  asl\n  asl\n  asl\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%00001111\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n\n  ;; enable filter on current channel\n  txa\n  tay\n  iny\n  lda #$80\n_opc_filter_loop:\n  rol\n  dey\n  bne _opc_filter_loop\n_opc_filter_done:\n  sta ZP_TEMP\n  lda sid_flt_res, x\n  ora ZP_TEMP\n  sta sid_flt_res, x\n  rts\n\nopc_wave:\n  jsr fetch_song_byte   ; get op 1\n  sta wave, x\n  rts\n\nopc_pw:\n  ; TODO\n  jsr fetch_song_byte   ; get op 1 (lo)\n  jsr fetch_song_byte   ; get op 1 (hi)\n  rts\n\nopc_wave_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta wave_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta wave_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta wave_seq + SEQ_JMP, x\n  rts\n\nopc_pw_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  sta pw_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  sta pw_seq + SEQ_HI, x\n  lda #$ff\n  sta pw_seq + SEQ_JMP, x\n  rts\n\nopc_np_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta np_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta np_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta np_seq + SEQ_JMP, x\n  rts\n\nopc_pitch_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta pitch_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta pitch_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta pitch_seq + SEQ_JMP, x\n  rts\n\nopc_abs_pitch_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta abs_pitch_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta abs_pitch_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta abs_pitch_seq + SEQ_JMP, x\n  rts\n\nopc_cutoff_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta cutoff_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta cutoff_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta cutoff_seq + SEQ_JMP, x\n  rts\n\nopc_res_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta res_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta res_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta res_seq + SEQ_JMP, x\n  rts\n\n\n;; RTS jump table launcher for Song commands\nopcode_launcher:\n  asl\n  tay\n  lda opcode_rts_tbl+1, y\n  pha\n  lda opcode_rts_tbl, y\n  pha\n  rts\n\nopcode_rts_tbl:\n  .word opc_pat_seq-1\n  .word opc_loop_start-1\n  .word opc_loop_end-1\n  .word opc_nlen-1\n  .word opc_word_nlen-1\n  .word opc_qlen-1\n  .word opc_word_qlen-1\n  .word opc_octave-1\n  .word opc_oct_inc-1\n  .word opc_oct_dec-1\n  .word opc_transpose-1\n  .word opc_volume-1\n  .word opc_inc_vol-1\n  .word opc_dec_vol-1\n  .word opc_pitch-1\n  .word opc_adsr-1\n  .word opc_filter-1\n  .word opc_wave-1\n  .word opc_pw-1\n  .word opc_wave_seq-1\n  .word opc_pw_seq-1\n  .word opc_np_seq-1\n  .word opc_pitch_seq-1\n  .word opc_abs_pitch_seq-1\n  .word opc_cutoff_seq-1\n  .word opc_res_seq-1\n"
  , __filename = "lib/player/_songcmds.asm";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("opc_pat_seq:\n  ; TODO\n  jsr fetch_song_byte   ; get op 1 (lo)\n  jsr fetch_song_byte   ; get op 2 (hi)\n  rts\n\nopc_loop_start:\n  lda loops_idx, x\n  clc\n  adc #3\n  sta loops_idx, x\n\n  sta ZP_TEMP\n  jsr fetch_song_byte   ; get op 1 (times)\n  ldy ZP_TEMP\n  sta loops_c, y\n\n  lda song_ptr_lo, x\n  sta loops_ptr_lo, y\n  lda song_ptr_hi, x\n  sta loops_ptr_hi, y\n\n  rts\n\nopc_loop_end:\n  ldy loops_idx, x\n\n  lda loops_c, y\n  sec\n  sbc #1\n  sta loops_c, y\n  beq _loop_ended\n\n  lda loops_ptr_lo, y\n  sta song_ptr_lo, x\n  lda loops_ptr_hi, y\n  sta song_ptr_hi, x\n  rts\n_loop_ended:\n  tya\n  sec\n  sbc #3\n  sta loops_idx, x\n  rts\n\nopc_nlen:\n  jsr fetch_song_byte   ; get op 1\n  sta nlen_lo, x\n  lda #0\n  sta nlen_hi, x\n  rts\n\nopc_word_nlen:\n  jsr fetch_song_byte   ; get op 1 lo\n  sta nlen_lo, x\n  jsr fetch_song_byte   ; get op 2 hi\n  sta nlen_hi, x\n  rts\n\nopc_qlen:\n  jsr fetch_song_byte   ; get op 1\n  sta qlen_lo, x\n  lda #0\n  sta qlen_hi, x\n  rts\n\nopc_word_qlen:\n  jsr fetch_song_byte   ; get op 1 lo\n  sta qlen_lo, x\n  jsr fetch_song_byte   ; get op 2 hi\n  sta qlen_hi, x\n  rts\n\nopc_octave:\n  jsr fetch_song_byte   ; get op 1\n  tay\n  lda octave_n_tbl, y\n  sta octave_n, x\n  rts\n\nopc_oct_inc:\n  lda octave_n, x\n  clc\n  adc #12\n  sta octave_n, x\n  rts\n\nopc_oct_dec:\n  lda octave_n, x\n  sec\n  sbc #12\n  sta octave_n, x\n  rts\n\nopc_transpose:\n  jsr fetch_song_byte   ; get op 1\n  sta ZP_TEMP\n  lda transpose, x\n  clc\n  adc ZP_TEMP\n  sta transpose, x\n  rts\n\nopc_volume:\n  jsr fetch_song_byte   ; get op 1\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%11110000\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n  rts\n\nopc_inc_vol:\n  lda sid_vol_mode, x\n  and #%00001111\n  tay\n  iny\n  cpy #%00010000          ; if it overflows, do nothing\n  beq _opc_inc_vol_done\n  tya\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%11110000\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n_opc_inc_vol_done:\n  rts\n\nopc_dec_vol:\n  lda sid_vol_mode, x\n  and #%00001111\n  tay\n  dey\n  cpy #$ff                ; if it underflows, do nothing\n  beq _opc_dec_vol_done\n  tya\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%11110000\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n_opc_dec_vol_done:\n  rts\n\nopc_pitch:\n  ; TODO\n  jsr fetch_song_byte   ; get op 1\n  rts\n\nopc_adsr:\n  jsr fetch_song_byte   ; get op 1 (ad)\n  sta sid_ad, x\n  jsr fetch_song_byte   ; get op 2 (sr)\n  sta sid_sr, x\n  rts\n\n; TODO Test!\nopc_filter:\n  ;; set mode\n  jsr fetch_song_byte   ; get op 1\n  asl\n  asl\n  asl\n  asl\n  sta ZP_TEMP\n  lda sid_vol_mode, x\n  and #%00001111\n  clc\n  adc ZP_TEMP\n  sta sid_vol_mode, x\n\n  ;; enable filter on current channel\n  txa\n  tay\n  iny\n  lda #$80\n_opc_filter_loop:\n  rol\n  dey\n  bne _opc_filter_loop\n_opc_filter_done:\n  sta ZP_TEMP\n  lda sid_flt_res, x\n  ora ZP_TEMP\n  sta sid_flt_res, x\n  rts\n\nopc_wave:\n  jsr fetch_song_byte   ; get op 1\n  sta wave, x\n  rts\n\nopc_pw:\n  ; TODO\n  jsr fetch_song_byte   ; get op 1 (lo)\n  jsr fetch_song_byte   ; get op 1 (hi)\n  rts\n\nopc_wave_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta wave_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta wave_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta wave_seq + SEQ_JMP, x\n  rts\n\nopc_pw_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  sta pw_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  sta pw_seq + SEQ_HI, x\n  lda #$ff\n  sta pw_seq + SEQ_JMP, x\n  rts\n\nopc_np_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta np_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta np_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta np_seq + SEQ_JMP, x\n  rts\n\nopc_pitch_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta pitch_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta pitch_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta pitch_seq + SEQ_JMP, x\n  rts\n\nopc_abs_pitch_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta abs_pitch_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta abs_pitch_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta abs_pitch_seq + SEQ_JMP, x\n  rts\n\nopc_cutoff_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta cutoff_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta cutoff_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta cutoff_seq + SEQ_JMP, x\n  rts\n\nopc_res_seq:\n  jsr fetch_song_byte   ; get op 1 (lo)\n  ;sta res_seq + SEQ_LO, x\n  jsr fetch_song_byte   ; get op 2 (hi)\n  ;sta res_seq + SEQ_HI, x\n  ;lda #$ff\n  ;sta res_seq + SEQ_JMP, x\n  rts\n\n\n;; RTS jump table launcher for Song commands\nopcode_launcher:\n  asl\n  tay\n  lda opcode_rts_tbl+1, y\n  pha\n  lda opcode_rts_tbl, y\n  pha\n  rts\n\nopcode_rts_tbl:\n  .word opc_pat_seq-1\n  .word opc_loop_start-1\n  .word opc_loop_end-1\n  .word opc_nlen-1\n  .word opc_word_nlen-1\n  .word opc_qlen-1\n  .word opc_word_qlen-1\n  .word opc_octave-1\n  .word opc_oct_inc-1\n  .word opc_oct_dec-1\n  .word opc_transpose-1\n  .word opc_volume-1\n  .word opc_inc_vol-1\n  .word opc_dec_vol-1\n  .word opc_pitch-1\n  .word opc_adsr-1\n  .word opc_filter-1\n  .word opc_wave-1\n  .word opc_pw-1\n  .word opc_wave_seq-1\n  .word opc_pw_seq-1\n  .word opc_np_seq-1\n  .word opc_pitch_seq-1\n  .word opc_abs_pitch_seq-1\n  .word opc_cutoff_seq-1\n  .word opc_res_seq-1\n")
    ; __line = 303
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line);
}

};
return fn(data, null, include);
},
"_seqcmds.asm": function(data) {
var include = function include(includePath, includedData) {
  return templates[includePath](includedData);
};
var fn = function anonymous(locals, escape, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, filename, lineno){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escape = escape || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = "opc_seq_jump_marker:\n  ldy seq_jmp, x\n  lda ZP_SEQ_I\n  sta (ZP_PTR_LO), y    ; store current index as jump marker\n  rts\n\nopc_seq_value:\n  jsr fetch_seq_op_byte    ; op1 val\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y\n  rts\n\nopc_seq_repeat:\n  jsr fetch_seq_op_byte    ; op1 val\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; store counter\n\n  rts\n\nopc_seq_loop:\n  jsr fetch_seq_op_byte    ; op1 val\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; store counter\n\n  jsr fetch_seq_op_byte    ; op3 step\n  ldy seq_step, x\n  sta (ZP_PTR_LO), y       ; store step\n\n  rts\n\nopc_seq_word_value:\n  jsr fetch_seq_op_byte    ; op1 val (lo)\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y\n\n  jsr fetch_seq_op_byte    ; op1 val (hi)\n  ldy seq_value_hi, x\n  sta (ZP_PTR_LO), y\n\n  rts\n\nopc_seq_word_repeat:\n  jsr fetch_seq_op_byte    ; op1 val (lo)\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op1 val (hi)\n  ldy seq_value_hi, x\n  sta (ZP_PTR_LO), y       ; store high byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; start counting\n\n  rts\n\nopc_seq_word_loop:\n  jsr fetch_seq_op_byte    ; op1 val (lo)\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op1 val (hi)\n  ldy seq_value_hi, x\n  sta (ZP_PTR_LO), y       ; store high byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; store counter\n\n  jsr fetch_seq_op_byte    ; op3 step\n  ldy seq_step, x\n  sta (ZP_PTR_LO), y       ; store step\n\n  rts\n\n\n;; RTS jump table launcher for Sequence commands\nopcode_seq_launcher:\n  and #%00001110     ; Keep bits #1-#4 only, use as index on opcode_seq table\n  tay\n  lda opcode_seq_rts_tbl+1, y\n  pha\n  lda opcode_seq_rts_tbl, y\n  pha\n  rts\n\nopcode_seq_rts_tbl:\n  .word opc_seq_jump_marker-1\n  .word opc_seq_value-1\n  .word opc_seq_repeat-1\n  .word opc_seq_loop-1\n  .word opc_seq_jump_marker-1   ; duplicate\n  .word opc_seq_word_value-1\n  .word opc_seq_word_repeat-1\n  .word opc_seq_word_loop-1\n\nfetch_seq_op_byte:\n  ldy ZP_SEQ_I\n  lda (ZP_SEQ_LO), y      ; get sequence byte with index\n  iny\n  sty ZP_SEQ_I            ; increment index\n  rts\n"
  , __filename = "lib/player/_seqcmds.asm";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("opc_seq_jump_marker:\n  ldy seq_jmp, x\n  lda ZP_SEQ_I\n  sta (ZP_PTR_LO), y    ; store current index as jump marker\n  rts\n\nopc_seq_value:\n  jsr fetch_seq_op_byte    ; op1 val\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y\n  rts\n\nopc_seq_repeat:\n  jsr fetch_seq_op_byte    ; op1 val\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; store counter\n\n  rts\n\nopc_seq_loop:\n  jsr fetch_seq_op_byte    ; op1 val\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; store counter\n\n  jsr fetch_seq_op_byte    ; op3 step\n  ldy seq_step, x\n  sta (ZP_PTR_LO), y       ; store step\n\n  rts\n\nopc_seq_word_value:\n  jsr fetch_seq_op_byte    ; op1 val (lo)\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y\n\n  jsr fetch_seq_op_byte    ; op1 val (hi)\n  ldy seq_value_hi, x\n  sta (ZP_PTR_LO), y\n\n  rts\n\nopc_seq_word_repeat:\n  jsr fetch_seq_op_byte    ; op1 val (lo)\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op1 val (hi)\n  ldy seq_value_hi, x\n  sta (ZP_PTR_LO), y       ; store high byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; start counting\n\n  rts\n\nopc_seq_word_loop:\n  jsr fetch_seq_op_byte    ; op1 val (lo)\n  ldy seq_value_lo, x\n  sta (ZP_PTR_LO), y       ; store low byte of value\n\n  jsr fetch_seq_op_byte    ; op1 val (hi)\n  ldy seq_value_hi, x\n  sta (ZP_PTR_LO), y       ; store high byte of value\n\n  jsr fetch_seq_op_byte    ; op2 times\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y       ; store counter\n\n  jsr fetch_seq_op_byte    ; op3 step\n  ldy seq_step, x\n  sta (ZP_PTR_LO), y       ; store step\n\n  rts\n\n\n;; RTS jump table launcher for Sequence commands\nopcode_seq_launcher:\n  and #%00001110     ; Keep bits #1-#4 only, use as index on opcode_seq table\n  tay\n  lda opcode_seq_rts_tbl+1, y\n  pha\n  lda opcode_seq_rts_tbl, y\n  pha\n  rts\n\nopcode_seq_rts_tbl:\n  .word opc_seq_jump_marker-1\n  .word opc_seq_value-1\n  .word opc_seq_repeat-1\n  .word opc_seq_loop-1\n  .word opc_seq_jump_marker-1   ; duplicate\n  .word opc_seq_word_value-1\n  .word opc_seq_word_repeat-1\n  .word opc_seq_word_loop-1\n\nfetch_seq_op_byte:\n  ldy ZP_SEQ_I\n  lda (ZP_SEQ_LO), y      ; get sequence byte with index\n  iny\n  sty ZP_SEQ_I            ; increment index\n  rts\n")
    ; __line = 111
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line);
}

};
return fn(data, null, include);
},
"_main.asm": function(data) {
var include = function include(includePath, includedData) {
  return templates[includePath](includedData);
};
var fn = function anonymous(locals, escape, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, filename, lineno){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escape = escape || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = "<%\n  function asm(value) {\n    let str;\n    if (typeof(value) === 'number') {\n      str = `$${value.toString(16)}`;\n    } else {\n      str = value;\n    }\n    return str;\n  }\n\n  function byteTable(values, sliceSize) {\n    sliceSize = sliceSize || 10;\n    let ss = '';\n    eachSlice(values, sliceSize, (slice) => {\n      ss = ss + '  .byte ' + slice.map((v) => { return asm(v); }).join(', ') + '\\n';\n    });\n    return ss;\n  }\n\n  function eachSlice(ary, size, callback) {\n    for (var i = 0, l = ary.length; i < l; i += size) {\n      callback.call(ary, ary.slice(i, i + size));\n    }\n  }\n\n  function initTriple(callback) {\n    return byteTable(initialStates.map(callback));\n  }\n\n  function lowByte(word) {\n    return word & 0xff;\n  }\n\n  function highByte(word) {\n    return (word>>8) & 0xff;\n  }\n%>\n;; === defines ===\n\n;; Song commands and flags\nI_NOTE_C     = $00\nI_NOTE_CS    = $01\nI_NOTE_D     = $02\nI_NOTE_DS    = $03\nI_NOTE_E     = $04\nI_NOTE_F     = $05\nI_NOTE_FS    = $06\nI_NOTE_G     = $07\nI_NOTE_GS    = $08\nI_NOTE_A     = $09\nI_NOTE_AS    = $0a\nI_NOTE_B     = $0b\nI_NOTE_REST  = $0c\nWITH_LEN_FLAG = $10\nWITH_Q_FLAG   = $20\nWORD_FLAG     = $40\nI_PATTERN       = $80\nI_LOOP_STR      = $81\nI_LOOP_END      = $82\nI_NLEN          = $83\nI_WORD_NLEN     = $84\nI_QLEN          = $85\nI_WORD_QLEN     = $86\nI_OCTAVE        = $87\nI_OCT_INC       = $88\nI_OCT_DEC       = $89\nI_TRANSPOSE     = $8a\nI_VOLUME        = $8b\nI_VOL_INC       = $8c\nI_VOL_DEC       = $8d\nI_PITCH         = $8e\nI_ADSR          = $8f\nI_FILTER        = $90\nI_WAVE          = $91\nI_PW            = $92\nI_WAVE_SEQ      = $93\nI_PW_SEQ        = $94\nI_NP_SEQ        = $95\nI_PITCH_SEQ     = $96\nI_ABS_PITCH_SEQ = $97\nI_CUTOFF_SEQ    = $98\nI_RES_SEQ       = $99\n\n;; Token to indicate end of a song or sequence\nI_EOF = $ff\n\n;; Sequence commands and flags\nI_SEQ_JUMP_MARKER = $00\nI_SEQ_VALUE       = $02\nI_SEQ_REPEAT      = $04\nI_SEQ_LOOP        = $06\nI_SEQ_WORD_FLAG   = %1000\n\n;; Offsets to fields in sequence structure\n;; e.g. pw_seq+SEQ_I --> pw_seq.i (if pw_seq were a C struct...)\nSEQ_LO       =  0   ; low byte of base pointer\nSEQ_HI       =  3   ; high byte of base pointer\nSEQ_I        =  6   ; index\nSEQ_JMP      =  9   ; jump marker index\nSEQ_COUNTER  = 12   ; repeat/loop counter\nSEQ_STEP     = 15   ; repeat step\nSEQ_VALUE_LO = 18   ; repeat/loop value lo\nSEQ_VALUE_HI = 21   ; repeat/loop value hi (word-only)\n\n;; Zero-page global variables\nZP_TEMP    = $f8\nZP_PTR_LO  = $f9\nZP_PTR_HI  = $fa\nZP_CHANNEL = $fb\nZP_SEQ_LO  = $fc\nZP_SEQ_HI  = $fd\nZP_SEQ_I   = $fe\n\n;; === code ===\n\ninit:\n  rts   ; nothing to do!\n\n\nplay:\n  ;; update SID registers first\n  jsr update_sid_regs\n\n  ;; play all channels\n  ldx #0\n  jsr play_channel\n\n  ldx #1\n  jsr play_channel\n\n  ldx #2\n  jsr play_channel\n\n<% if (debug) { %>\n  inc global_counter\n  bne _skip_global_counter\n  inc global_counter+1\n_skip_global_counter:\n<% } %>\n\n  rts\n\n\nupdate_sid_regs:\n  ldx #2\n  ldy #0\n_upd_loop:\n  lda sid_freq_lo, x\n  sta $d400, y\n  lda sid_freq_hi, x\n  sta $d401, y\n  lda sid_pw_lo, x\n  sta $d402, y\n  lda sid_pw_hi, x\n  sta $d403, y\n  lda sid_control, x\n  sta $d404, y\n  lda sid_ad, x\n  sta $d405, y\n  lda sid_sr, x\n  sta $d406, y\n  tya\n  adc #7\n  tay\n  dex\n  bpl _upd_loop\n\n  lda sid_fc_lo\n  sta $d415\n  lda sid_fc_hi\n  sta $d416\n  lda sid_flt_res\n  sta $d417\n  lda sid_vol_mode\n  sta $d418\n\n  rts\n\n\nplay_channel:\n  stx ZP_CHANNEL        ; save channel\n\n  lda finished, x\n  bne _done             ; branch if finished\n\n  lda playing, x\n  beq _fetch_loop       ; branch if not playing note\n\n  ;; decrement quantization length counter\n  ldy qlen_c_lo, x\n  lda qlen_c_hi, x\n  cpy #$01\n  dey\n  sbc #0\n  sta ZP_TEMP\n  tya\n  sta qlen_c_lo, x\n  lda ZP_TEMP\n  sta qlen_c_hi, x\n  bcs _dec_nlen_c       ; branches if qlen_c >= 0\n\n  ;; gate off\n  lda wave, x\n  sta sid_control, x\n\n_dec_nlen_c:\n  ;; decrement note length counter\n  ldy nlen_c_lo, x\n  lda nlen_c_hi, x\n  cpy #$01\n  dey\n  sbc #0\n  sta ZP_TEMP\n  tya\n  sta nlen_c_lo, x\n  lda ZP_TEMP\n  sta nlen_c_hi, x\n  bcc _stop_playing     ; branches if nlen_c < 0\n  jmp _play_sequences\n\n_stop_playing:\n  ;; stop playing\n  lda #0\n  sta playing, x\n\n_fetch_loop:\n  jsr fetch_song_byte\n\n  cmp #I_EOF\n  bne _check_note       ; branch if cmd != I_EOF\n  lda #1\n  sta finished, x       ; mark channel as finished\n  rts\n\n_check_note:\n  cmp #$80\n  bcc _play_note        ; branch if cmd < $80\n\n  ;; instruction is a command: use jump table\n  jsr opcode_launcher\n\n  lda #0\n  beq _fetch_loop       ; keep fetching and decoding instructions\n                        ; until a note is reached\n_done:\n  rts\n\n_play_note:\n  ldx ZP_CHANNEL\n\n  ;; convert relative to absolute note, transpose it\n  pha\n  and #%00001111\n  cmp #I_NOTE_REST\n  beq _reload_counters\n\n  ;; add octave\n  clc\n  adc octave_n, x\n  adc transpose, x\n\n  ;; load freq of new note\n  tay\n  lda freq_lo, y\n  sta sid_freq_lo, x\n  lda freq_hi, y\n  sta sid_freq_hi, x\n\n  ;; gate on\n  ldy wave, x\n  iny           ; enable gate\n  tya\n  sta sid_control, x\n\n_reload_counters:\n  pla\n  and #%01110000\n  sta ZP_TEMP\n\n  and #WITH_LEN_FLAG\n  bne _note_with_len\n\n  ;; reload frame counters with default lengths\n  lda nlen_lo, x\n  sta nlen_c_lo, x\n  lda nlen_hi, x\n  sta nlen_c_hi, x\n  jmp _reload_q_counters\n\n_note_with_len:\n  ;; reload note length counter with operand\n  jsr fetch_song_byte\n  sta nlen_c_lo, x\n  lda ZP_TEMP\n  and #WORD_FLAG\n  beq _skip_len_hi\n  jsr fetch_song_byte\n_skip_len_hi:\n  sta nlen_c_hi, x\n\n_reload_q_counters:\n  lda ZP_TEMP\n  and #WITH_Q_FLAG\n  bne _note_with_quant\n\n  ;; reload quantization frame counters with defaults\n  lda qlen_lo, x\n  sta qlen_c_lo, x\n  lda qlen_hi, x\n  sta qlen_c_hi, x\n  jmp _reset_sequence_indexes\n\n_note_with_quant:\n  ;; reload note length counter with operand\n  jsr fetch_song_byte\n  sta qlen_c_lo, x\n  lda ZP_TEMP\n  and #WORD_FLAG\n  beq _skip_q_hi\n  jsr fetch_song_byte\n_skip_q_hi:\n  sta qlen_c_hi, x\n\n_reset_sequence_indexes:\n  lda #0\n  ;; TODO Do it for all sequences\n  sta pw_seq + SEQ_I, x\n\n  lda #1\n  sta playing, x\n\n_play_sequences:\n  ;; TODO Do it for all sequences\n\n  ;; ************************************************\n  lda #<pw_seq\n  sta ZP_PTR_LO\n  lda #>pw_seq\n  sta ZP_PTR_HI\n\n  lda pw_seq + SEQ_LO, x\n  sta ZP_SEQ_LO\n  lda pw_seq + SEQ_HI, x\n  sta ZP_SEQ_HI\n  lda pw_seq + SEQ_I, x\n  sta ZP_SEQ_I\n\n  jsr play_sequence\n\n  ldy seq_value_lo, x\n  lda (ZP_PTR_LO), y\n  sta sid_pw_lo, x\n\n  ldy seq_value_hi, x\n  lda (ZP_PTR_LO), y\n  sta sid_pw_hi, x\n\n  lda ZP_SEQ_I\n  sta pw_seq + SEQ_I, x\n  ;; ************************************************\n\n  rts\n\n\nfetch_song_byte:\n  ; fetch value and store it\n  lda song_ptr_lo, x\n  sta ZP_PTR_LO\n  lda song_ptr_hi, x\n  sta ZP_PTR_HI\n  ldy #0\n  lda (ZP_PTR_LO), y\n  pha\n\n  ;; increment song_ptr\n  lda song_ptr_hi, x\n  ldy song_ptr_lo, x\n  cpy #$ff\n  iny\n  adc #0\n  pha\n  tya\n  sta song_ptr_lo, x\n  pla\n  sta song_ptr_hi, x\n\n  pla\n  rts\n\n\nplay_sequence:\n  ldy seq_counter, x\n  lda (ZP_PTR_LO), y\n  beq _next_seq_byte          ; branch if counter is already 0\n\n  tay\n  dey                         ; decrement counter\n  tya\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y          ; update counter field\n  beq _next_seq_byte          ; if counter reaches 0, advance\n\n  ldy seq_step, x\n  lda (ZP_PTR_LO), y\n  sta ZP_TEMP                 ; get step value\n  bne _add_step_value\n  rts\n\n_add_step_value:\n  ;; add step to sequence value\n  ldy seq_value_lo, x\n  lda (ZP_PTR_LO), y\n  adc ZP_TEMP\n  sta (ZP_PTR_LO), y\n\n  ldy seq_value_hi, x\n  lda (ZP_PTR_LO), y\n  adc #0\n  sta (ZP_PTR_LO), y\n  rts\n\n_next_seq_byte:\n  jsr fetch_seq_byte\n  cmp #I_EOF\n  beq _play_seq_done\n\n  jmp opcode_seq_launcher\n\n_play_seq_done:\n  ;; if jump marker is != $ff, set index to SEQ_JMP\n  ldx ZP_CHANNEL\n  ldy seq_jmp, x\n  lda (ZP_PTR_LO), y          ; get jump marker index\n  cmp #$ff\n  beq _seq_done\n\n  sta ZP_SEQ_I                ; use jump marker index as current index\n  jmp _next_seq_byte\n\n_seq_done:\n  rts\n\n\nfetch_seq_byte:\n  ldy ZP_SEQ_I\n  lda (ZP_SEQ_LO), y      ; get sequence byte with index\n  cmp #I_EOF\n  beq _fetch_seq_done     ; branch if sequence ended\n  iny\n  sty ZP_SEQ_I            ; increment index\n_fetch_seq_done:\n  rts\n\n<%- include(\"_songcmds.asm\") %>\n<%- include(\"_seqcmds.asm\") %>\n\n;; === data ===\n\n;; ghost registers by channel\nsid_freq_lo:  .byte 0, 0, 0\nsid_freq_hi:  .byte 0, 0, 0\nsid_pw_lo:    .byte 0, 0, 0\nsid_pw_hi:    .byte $8, $8, $8\nsid_control:  .byte 0, 0, 0\nsid_ad:     <%- initTriple(s => { return s.ad }) -%>\nsid_sr:     <%- initTriple(s => { return s.sr }) -%>\n\n;; ghost registers for all channels\nsid_fc_lo:    .byte 0\nsid_fc_hi:    .byte 0\nsid_flt_res:  .byte 0\nsid_vol_mode: .byte $0c\n\n;; song pointers\nsong_ptr_lo: .byte <song0, <song1, <song2\nsong_ptr_hi: .byte >song0, >song1, >song2\nplaying:     .byte 0, 0, 0\nfinished:    .byte 0, 0, 0\n\n;; more state vars\nnlen_lo:   <%- initTriple(s => { return lowByte(s.noteLengthFrames) }) -%>\nnlen_hi:   <%- initTriple(s => { return highByte(s.noteLengthFrames) }) -%>\nqlen_lo:   <%- initTriple(s => { return lowByte(s.quantLengthFrames) }) -%>\nqlen_hi:   <%- initTriple(s => { return highByte(s.quantLengthFrames) }) -%>\noctave_n:  <%- initTriple(s => { return s.octave * 12}) -%>\ntranspose: <%- initTriple(s => { return s.transpose }) -%>\npitch:     <%- initTriple(s => { return s.pitch }) -%>\nwave:      <%- initTriple(s => { return s.wave }) -%>\n\n;; counters\nnlen_c_lo: .byte 0, 0, 0\nnlen_c_hi: .byte 0, 0, 0\nqlen_c_lo: .byte 0, 0, 0\nqlen_c_hi: .byte 0, 0, 0\n\n;; loop stacks (8 simultaneous loops max, per channel)\nloops_idx:\n  .byte $fd, $fe, $ff\nloops_ptr_lo:\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\nloops_ptr_hi:\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\nloops_c:\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n\npw_seq:     ; word sequence\n  .byte <eof, <eof, <eof\n  .byte >eof, >eof, >eof\n  .byte 0, 0, 0\n  .byte $ff, $ff, $ff\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n\n<% if (debug) { %>\nglobal_counter: .word 0\n<% } %>\n\n;; === rodata ===\n\n;; Note offsets for each octave\noctave_n_tbl:\n  .byte 0, 12, 24, 36, 48, 60, 72, 84\n\n;; offsets for accessing fields in sequence structure with Y-indirection\nseq_lo:       .byte 0, 1, 2\nseq_hi:       .byte 3, 4, 5\nseq_i:        .byte 6, 7, 8\nseq_jmp:      .byte 9, 10, 11\nseq_counter:  .byte 12, 13, 14\nseq_step:     .byte 15, 16, 17\nseq_value_lo: .byte 18, 19, 20\nseq_value_hi: .byte 21, 22, 23\n\neof: .byte I_EOF\n\n<%- include(\"freq/_pal.asm\") %>\n\n;; Sequences\n<%# sequences %>\n\n;; Notes/commands tables\n<%_ for (let i = 0; i < 3; i++) { _%>\nsong<%- i %>:\n<%- byteTable(song[i], 1) %>\n<%_ } _%>\n"
  , __filename = "lib/player/_main.asm";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; 
  function asm(value) {
    let str;
    if (typeof(value) === 'number') {
      str = `$${value.toString(16)}`;
    } else {
      str = value;
    }
    return str;
  }

  function byteTable(values, sliceSize) {
    sliceSize = sliceSize || 10;
    let ss = '';
    eachSlice(values, sliceSize, (slice) => {
      ss = ss + '  .byte ' + slice.map((v) => { return asm(v); }).join(', ') + '\n';
    });
    return ss;
  }

  function eachSlice(ary, size, callback) {
    for (var i = 0, l = ary.length; i < l; i += size) {
      callback.call(ary, ary.slice(i, i + size));
    }
  }

  function initTriple(callback) {
    return byteTable(initialStates.map(callback));
  }

  function lowByte(word) {
    return word & 0xff;
  }

  function highByte(word) {
    return (word>>8) & 0xff;
  }

    ; __line = 38
    ; __append("\n;; === defines ===\n\n;; Song commands and flags\nI_NOTE_C     = $00\nI_NOTE_CS    = $01\nI_NOTE_D     = $02\nI_NOTE_DS    = $03\nI_NOTE_E     = $04\nI_NOTE_F     = $05\nI_NOTE_FS    = $06\nI_NOTE_G     = $07\nI_NOTE_GS    = $08\nI_NOTE_A     = $09\nI_NOTE_AS    = $0a\nI_NOTE_B     = $0b\nI_NOTE_REST  = $0c\nWITH_LEN_FLAG = $10\nWITH_Q_FLAG   = $20\nWORD_FLAG     = $40\nI_PATTERN       = $80\nI_LOOP_STR      = $81\nI_LOOP_END      = $82\nI_NLEN          = $83\nI_WORD_NLEN     = $84\nI_QLEN          = $85\nI_WORD_QLEN     = $86\nI_OCTAVE        = $87\nI_OCT_INC       = $88\nI_OCT_DEC       = $89\nI_TRANSPOSE     = $8a\nI_VOLUME        = $8b\nI_VOL_INC       = $8c\nI_VOL_DEC       = $8d\nI_PITCH         = $8e\nI_ADSR          = $8f\nI_FILTER        = $90\nI_WAVE          = $91\nI_PW            = $92\nI_WAVE_SEQ      = $93\nI_PW_SEQ        = $94\nI_NP_SEQ        = $95\nI_PITCH_SEQ     = $96\nI_ABS_PITCH_SEQ = $97\nI_CUTOFF_SEQ    = $98\nI_RES_SEQ       = $99\n\n;; Token to indicate end of a song or sequence\nI_EOF = $ff\n\n;; Sequence commands and flags\nI_SEQ_JUMP_MARKER = $00\nI_SEQ_VALUE       = $02\nI_SEQ_REPEAT      = $04\nI_SEQ_LOOP        = $06\nI_SEQ_WORD_FLAG   = %1000\n\n;; Offsets to fields in sequence structure\n;; e.g. pw_seq+SEQ_I --> pw_seq.i (if pw_seq were a C struct...)\nSEQ_LO       =  0   ; low byte of base pointer\nSEQ_HI       =  3   ; high byte of base pointer\nSEQ_I        =  6   ; index\nSEQ_JMP      =  9   ; jump marker index\nSEQ_COUNTER  = 12   ; repeat/loop counter\nSEQ_STEP     = 15   ; repeat step\nSEQ_VALUE_LO = 18   ; repeat/loop value lo\nSEQ_VALUE_HI = 21   ; repeat/loop value hi (word-only)\n\n;; Zero-page global variables\nZP_TEMP    = $f8\nZP_PTR_LO  = $f9\nZP_PTR_HI  = $fa\nZP_CHANNEL = $fb\nZP_SEQ_LO  = $fc\nZP_SEQ_HI  = $fd\nZP_SEQ_I   = $fe\n\n;; === code ===\n\ninit:\n  rts   ; nothing to do!\n\n\nplay:\n  ;; update SID registers first\n  jsr update_sid_regs\n\n  ;; play all channels\n  ldx #0\n  jsr play_channel\n\n  ldx #1\n  jsr play_channel\n\n  ldx #2\n  jsr play_channel\n\n")
    ; __line = 135
    ;  if (debug) { 
    ; __append("\n  inc global_counter\n  bne _skip_global_counter\n  inc global_counter+1\n_skip_global_counter:\n")
    ; __line = 140
    ;  } 
    ; __append("\n\n  rts\n\n\nupdate_sid_regs:\n  ldx #2\n  ldy #0\n_upd_loop:\n  lda sid_freq_lo, x\n  sta $d400, y\n  lda sid_freq_hi, x\n  sta $d401, y\n  lda sid_pw_lo, x\n  sta $d402, y\n  lda sid_pw_hi, x\n  sta $d403, y\n  lda sid_control, x\n  sta $d404, y\n  lda sid_ad, x\n  sta $d405, y\n  lda sid_sr, x\n  sta $d406, y\n  tya\n  adc #7\n  tay\n  dex\n  bpl _upd_loop\n\n  lda sid_fc_lo\n  sta $d415\n  lda sid_fc_hi\n  sta $d416\n  lda sid_flt_res\n  sta $d417\n  lda sid_vol_mode\n  sta $d418\n\n  rts\n\n\nplay_channel:\n  stx ZP_CHANNEL        ; save channel\n\n  lda finished, x\n  bne _done             ; branch if finished\n\n  lda playing, x\n  beq _fetch_loop       ; branch if not playing note\n\n  ;; decrement quantization length counter\n  ldy qlen_c_lo, x\n  lda qlen_c_hi, x\n  cpy #$01\n  dey\n  sbc #0\n  sta ZP_TEMP\n  tya\n  sta qlen_c_lo, x\n  lda ZP_TEMP\n  sta qlen_c_hi, x\n  bcs _dec_nlen_c       ; branches if qlen_c >= 0\n\n  ;; gate off\n  lda wave, x\n  sta sid_control, x\n\n_dec_nlen_c:\n  ;; decrement note length counter\n  ldy nlen_c_lo, x\n  lda nlen_c_hi, x\n  cpy #$01\n  dey\n  sbc #0\n  sta ZP_TEMP\n  tya\n  sta nlen_c_lo, x\n  lda ZP_TEMP\n  sta nlen_c_hi, x\n  bcc _stop_playing     ; branches if nlen_c < 0\n  jmp _play_sequences\n\n_stop_playing:\n  ;; stop playing\n  lda #0\n  sta playing, x\n\n_fetch_loop:\n  jsr fetch_song_byte\n\n  cmp #I_EOF\n  bne _check_note       ; branch if cmd != I_EOF\n  lda #1\n  sta finished, x       ; mark channel as finished\n  rts\n\n_check_note:\n  cmp #$80\n  bcc _play_note        ; branch if cmd < $80\n\n  ;; instruction is a command: use jump table\n  jsr opcode_launcher\n\n  lda #0\n  beq _fetch_loop       ; keep fetching and decoding instructions\n                        ; until a note is reached\n_done:\n  rts\n\n_play_note:\n  ldx ZP_CHANNEL\n\n  ;; convert relative to absolute note, transpose it\n  pha\n  and #%00001111\n  cmp #I_NOTE_REST\n  beq _reload_counters\n\n  ;; add octave\n  clc\n  adc octave_n, x\n  adc transpose, x\n\n  ;; load freq of new note\n  tay\n  lda freq_lo, y\n  sta sid_freq_lo, x\n  lda freq_hi, y\n  sta sid_freq_hi, x\n\n  ;; gate on\n  ldy wave, x\n  iny           ; enable gate\n  tya\n  sta sid_control, x\n\n_reload_counters:\n  pla\n  and #%01110000\n  sta ZP_TEMP\n\n  and #WITH_LEN_FLAG\n  bne _note_with_len\n\n  ;; reload frame counters with default lengths\n  lda nlen_lo, x\n  sta nlen_c_lo, x\n  lda nlen_hi, x\n  sta nlen_c_hi, x\n  jmp _reload_q_counters\n\n_note_with_len:\n  ;; reload note length counter with operand\n  jsr fetch_song_byte\n  sta nlen_c_lo, x\n  lda ZP_TEMP\n  and #WORD_FLAG\n  beq _skip_len_hi\n  jsr fetch_song_byte\n_skip_len_hi:\n  sta nlen_c_hi, x\n\n_reload_q_counters:\n  lda ZP_TEMP\n  and #WITH_Q_FLAG\n  bne _note_with_quant\n\n  ;; reload quantization frame counters with defaults\n  lda qlen_lo, x\n  sta qlen_c_lo, x\n  lda qlen_hi, x\n  sta qlen_c_hi, x\n  jmp _reset_sequence_indexes\n\n_note_with_quant:\n  ;; reload note length counter with operand\n  jsr fetch_song_byte\n  sta qlen_c_lo, x\n  lda ZP_TEMP\n  and #WORD_FLAG\n  beq _skip_q_hi\n  jsr fetch_song_byte\n_skip_q_hi:\n  sta qlen_c_hi, x\n\n_reset_sequence_indexes:\n  lda #0\n  ;; TODO Do it for all sequences\n  sta pw_seq + SEQ_I, x\n\n  lda #1\n  sta playing, x\n\n_play_sequences:\n  ;; TODO Do it for all sequences\n\n  ;; ************************************************\n  lda #<pw_seq\n  sta ZP_PTR_LO\n  lda #>pw_seq\n  sta ZP_PTR_HI\n\n  lda pw_seq + SEQ_LO, x\n  sta ZP_SEQ_LO\n  lda pw_seq + SEQ_HI, x\n  sta ZP_SEQ_HI\n  lda pw_seq + SEQ_I, x\n  sta ZP_SEQ_I\n\n  jsr play_sequence\n\n  ldy seq_value_lo, x\n  lda (ZP_PTR_LO), y\n  sta sid_pw_lo, x\n\n  ldy seq_value_hi, x\n  lda (ZP_PTR_LO), y\n  sta sid_pw_hi, x\n\n  lda ZP_SEQ_I\n  sta pw_seq + SEQ_I, x\n  ;; ************************************************\n\n  rts\n\n\nfetch_song_byte:\n  ; fetch value and store it\n  lda song_ptr_lo, x\n  sta ZP_PTR_LO\n  lda song_ptr_hi, x\n  sta ZP_PTR_HI\n  ldy #0\n  lda (ZP_PTR_LO), y\n  pha\n\n  ;; increment song_ptr\n  lda song_ptr_hi, x\n  ldy song_ptr_lo, x\n  cpy #$ff\n  iny\n  adc #0\n  pha\n  tya\n  sta song_ptr_lo, x\n  pla\n  sta song_ptr_hi, x\n\n  pla\n  rts\n\n\nplay_sequence:\n  ldy seq_counter, x\n  lda (ZP_PTR_LO), y\n  beq _next_seq_byte          ; branch if counter is already 0\n\n  tay\n  dey                         ; decrement counter\n  tya\n  ldy seq_counter, x\n  sta (ZP_PTR_LO), y          ; update counter field\n  beq _next_seq_byte          ; if counter reaches 0, advance\n\n  ldy seq_step, x\n  lda (ZP_PTR_LO), y\n  sta ZP_TEMP                 ; get step value\n  bne _add_step_value\n  rts\n\n_add_step_value:\n  ;; add step to sequence value\n  ldy seq_value_lo, x\n  lda (ZP_PTR_LO), y\n  adc ZP_TEMP\n  sta (ZP_PTR_LO), y\n\n  ldy seq_value_hi, x\n  lda (ZP_PTR_LO), y\n  adc #0\n  sta (ZP_PTR_LO), y\n  rts\n\n_next_seq_byte:\n  jsr fetch_seq_byte\n  cmp #I_EOF\n  beq _play_seq_done\n\n  jmp opcode_seq_launcher\n\n_play_seq_done:\n  ;; if jump marker is != $ff, set index to SEQ_JMP\n  ldx ZP_CHANNEL\n  ldy seq_jmp, x\n  lda (ZP_PTR_LO), y          ; get jump marker index\n  cmp #$ff\n  beq _seq_done\n\n  sta ZP_SEQ_I                ; use jump marker index as current index\n  jmp _next_seq_byte\n\n_seq_done:\n  rts\n\n\nfetch_seq_byte:\n  ldy ZP_SEQ_I\n  lda (ZP_SEQ_LO), y      ; get sequence byte with index\n  cmp #I_EOF\n  beq _fetch_seq_done     ; branch if sequence ended\n  iny\n  sty ZP_SEQ_I            ; increment index\n_fetch_seq_done:\n  rts\n\n")
    ; __line = 455
    ; __append(include("_songcmds.asm"))
    ; __append("\n")
    ; __line = 456
    ; __append(include("_seqcmds.asm"))
    ; __append("\n\n;; === data ===\n\n;; ghost registers by channel\nsid_freq_lo:  .byte 0, 0, 0\nsid_freq_hi:  .byte 0, 0, 0\nsid_pw_lo:    .byte 0, 0, 0\nsid_pw_hi:    .byte $8, $8, $8\nsid_control:  .byte 0, 0, 0\nsid_ad:     ")
    ; __line = 466
    ; __append(initTriple(s => { return s.ad }))
    ; __append("sid_sr:     ")
    ; __line = 467
    ; __append(initTriple(s => { return s.sr }))
    ; __append("\n;; ghost registers for all channels\nsid_fc_lo:    .byte 0\nsid_fc_hi:    .byte 0\nsid_flt_res:  .byte 0\nsid_vol_mode: .byte $0c\n\n;; song pointers\nsong_ptr_lo: .byte <song0, <song1, <song2\nsong_ptr_hi: .byte >song0, >song1, >song2\nplaying:     .byte 0, 0, 0\nfinished:    .byte 0, 0, 0\n\n;; more state vars\nnlen_lo:   ")
    ; __line = 482
    ; __append(initTriple(s => { return lowByte(s.noteLengthFrames) }))
    ; __append("nlen_hi:   ")
    ; __line = 483
    ; __append(initTriple(s => { return highByte(s.noteLengthFrames) }))
    ; __append("qlen_lo:   ")
    ; __line = 484
    ; __append(initTriple(s => { return lowByte(s.quantLengthFrames) }))
    ; __append("qlen_hi:   ")
    ; __line = 485
    ; __append(initTriple(s => { return highByte(s.quantLengthFrames) }))
    ; __append("octave_n:  ")
    ; __line = 486
    ; __append(initTriple(s => { return s.octave * 12}))
    ; __append("transpose: ")
    ; __line = 487
    ; __append(initTriple(s => { return s.transpose }))
    ; __append("pitch:     ")
    ; __line = 488
    ; __append(initTriple(s => { return s.pitch }))
    ; __append("wave:      ")
    ; __line = 489
    ; __append(initTriple(s => { return s.wave }))
    ; __append("\n;; counters\nnlen_c_lo: .byte 0, 0, 0\nnlen_c_hi: .byte 0, 0, 0\nqlen_c_lo: .byte 0, 0, 0\nqlen_c_hi: .byte 0, 0, 0\n\n;; loop stacks (8 simultaneous loops max, per channel)\nloops_idx:\n  .byte $fd, $fe, $ff\nloops_ptr_lo:\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\nloops_ptr_hi:\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\nloops_c:\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n\npw_seq:     ; word sequence\n  .byte <eof, <eof, <eof\n  .byte >eof, >eof, >eof\n  .byte 0, 0, 0\n  .byte $ff, $ff, $ff\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n  .byte 0, 0, 0\n\n")
    ; __line = 538
    ;  if (debug) { 
    ; __append("\nglobal_counter: .word 0\n")
    ; __line = 540
    ;  } 
    ; __append("\n\n;; === rodata ===\n\n;; Note offsets for each octave\noctave_n_tbl:\n  .byte 0, 12, 24, 36, 48, 60, 72, 84\n\n;; offsets for accessing fields in sequence structure with Y-indirection\nseq_lo:       .byte 0, 1, 2\nseq_hi:       .byte 3, 4, 5\nseq_i:        .byte 6, 7, 8\nseq_jmp:      .byte 9, 10, 11\nseq_counter:  .byte 12, 13, 14\nseq_step:     .byte 15, 16, 17\nseq_value_lo: .byte 18, 19, 20\nseq_value_hi: .byte 21, 22, 23\n\neof: .byte I_EOF\n\n")
    ; __line = 560
    ; __append(include("freq/_pal.asm"))
    ; __append("\n\n;; Sequences\n")
    ; __line = 563
    ; __append("\n\n;; Notes/commands tables\n")
    ; __line = 566
    ;  for (let i = 0; i < 3; i++) { 
    ; __append("song")
    ; __line = 567
    ; __append(i)
    ; __append(":\n")
    ; __line = 568
    ; __append(byteTable(song[i], 1))
    ; __append("\n")
    ; __line = 569
    ;  } 
    ; __line = 570
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line);
}

};
return fn(data, null, include);
},
"freq/_ntsc.asm": function(data) {
var include = function include(includePath, includedData) {
  return templates[includePath](includedData);
};
var fn = function anonymous(locals, escape, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, filename, lineno){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escape = escape || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = ";; Frequency table for NTSC\n;;\nfreq_lo:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $0c,$1c,$2d,$3f,$52,$66,$7b,$92,$aa,$c3,$de,$fa  ; 1\n  .byte $18,$38,$5a,$7e,$a4,$cc,$f7,$24,$54,$86,$bc,$f5  ; 2\n  .byte $31,$71,$b5,$fc,$48,$98,$ee,$48,$a9,$0d,$79,$ea  ; 3\n  .byte $62,$e2,$6a,$f8,$90,$30,$dc,$90,$52,$1a,$f2,$d4  ; 4\n  .byte $c4,$c4,$d4,$f0,$20,$60,$b8,$20,$a4,$34,$e4,$a8  ; 5\n  .byte $88,$88,$a8,$e0,$40,$c0,$70,$40,$48,$68,$c8,$50  ; 6\n  .byte $10,$10,$50,$c0,$80,$80,$e0,$80,$90,$d0,$90,$a0  ; 7\n  .byte $20,$20,$a0,$80,$00,$00,$c0,$00,$20,$a0,$20,$40  ; 8\n\nfreq_hi:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01  ; 1\n  .byte $02,$02,$02,$02,$02,$02,$02,$03,$03,$03,$03,$03  ; 2\n  .byte $04,$04,$04,$04,$05,$05,$05,$06,$06,$07,$07,$07  ; 3\n  .byte $08,$08,$09,$09,$0a,$0b,$0b,$0c,$0d,$0e,$0e,$0f  ; 4\n  .byte $10,$11,$12,$13,$15,$16,$17,$19,$1a,$1c,$1d,$1f  ; 5\n  .byte $21,$23,$25,$27,$2a,$2c,$2f,$32,$35,$38,$3b,$3f  ; 6\n  .byte $43,$47,$4b,$4f,$54,$59,$5e,$64,$6a,$70,$77,$7e  ; 7\n  .byte $86,$8e,$96,$9f,$a9,$b3,$bd,$c9,$d5,$e1,$ef,$fd  ; 8\n"
  , __filename = "lib/player/freq/_ntsc.asm";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append(";; Frequency table for NTSC\n;;\nfreq_lo:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $0c,$1c,$2d,$3f,$52,$66,$7b,$92,$aa,$c3,$de,$fa  ; 1\n  .byte $18,$38,$5a,$7e,$a4,$cc,$f7,$24,$54,$86,$bc,$f5  ; 2\n  .byte $31,$71,$b5,$fc,$48,$98,$ee,$48,$a9,$0d,$79,$ea  ; 3\n  .byte $62,$e2,$6a,$f8,$90,$30,$dc,$90,$52,$1a,$f2,$d4  ; 4\n  .byte $c4,$c4,$d4,$f0,$20,$60,$b8,$20,$a4,$34,$e4,$a8  ; 5\n  .byte $88,$88,$a8,$e0,$40,$c0,$70,$40,$48,$68,$c8,$50  ; 6\n  .byte $10,$10,$50,$c0,$80,$80,$e0,$80,$90,$d0,$90,$a0  ; 7\n  .byte $20,$20,$a0,$80,$00,$00,$c0,$00,$20,$a0,$20,$40  ; 8\n\nfreq_hi:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01  ; 1\n  .byte $02,$02,$02,$02,$02,$02,$02,$03,$03,$03,$03,$03  ; 2\n  .byte $04,$04,$04,$04,$05,$05,$05,$06,$06,$07,$07,$07  ; 3\n  .byte $08,$08,$09,$09,$0a,$0b,$0b,$0c,$0d,$0e,$0e,$0f  ; 4\n  .byte $10,$11,$12,$13,$15,$16,$17,$19,$1a,$1c,$1d,$1f  ; 5\n  .byte $21,$23,$25,$27,$2a,$2c,$2f,$32,$35,$38,$3b,$3f  ; 6\n  .byte $43,$47,$4b,$4f,$54,$59,$5e,$64,$6a,$70,$77,$7e  ; 7\n  .byte $86,$8e,$96,$9f,$a9,$b3,$bd,$c9,$d5,$e1,$ef,$fd  ; 8\n")
    ; __line = 24
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line);
}

};
return fn(data, null, include);
},
"freq/_pal.asm": function(data) {
var include = function include(includePath, includedData) {
  return templates[includePath](includedData);
};
var fn = function anonymous(locals, escape, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, filename, lineno){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escape = escape || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = ";; Frequency table for PAL-B\n;;\nfreq_lo:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $17,$27,$39,$4b,$5f,$74,$8a,$a1,$ba,$d4,$f0,$0e  ; 1\n  .byte $2d,$4e,$71,$96,$be,$e8,$14,$43,$74,$a9,$e1,$1c  ; 2\n  .byte $5a,$9c,$e2,$2d,$7c,$cf,$28,$85,$e8,$52,$c1,$37  ; 3\n  .byte $b4,$39,$c5,$5a,$f7,$9e,$4f,$0a,$d1,$a3,$82,$6e  ; 4\n  .byte $68,$71,$8a,$b3,$ee,$3c,$9e,$15,$a2,$46,$04,$dc  ; 5\n  .byte $d0,$e2,$14,$67,$dd,$79,$3c,$29,$44,$8d,$08,$b8  ; 6\n  .byte $a1,$c5,$28,$cd,$ba,$f1,$78,$53,$87,$1a,$10,$71  ; 7\n  .byte $42,$89,$4f,$9b,$74,$e2,$f0,$a6,$0e,$33,$20,$ff  ; 8\n\nfreq_hi:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$02  ; 1\n  .byte $02,$02,$02,$02,$02,$02,$03,$03,$03,$03,$03,$04  ; 2\n  .byte $04,$04,$04,$05,$05,$05,$06,$06,$06,$07,$07,$08  ; 3\n  .byte $08,$09,$09,$0a,$0a,$0b,$0c,$0d,$0d,$0e,$0f,$10  ; 4\n  .byte $11,$12,$13,$14,$15,$17,$18,$1a,$1b,$1d,$1f,$20  ; 5\n  .byte $22,$24,$27,$29,$2b,$2e,$31,$34,$37,$3a,$3e,$41  ; 6\n  .byte $45,$49,$4e,$52,$57,$5c,$62,$68,$6e,$75,$7c,$83  ; 7\n  .byte $8b,$93,$9c,$a5,$af,$b9,$c4,$d0,$dd,$ea,$f8,$ff  ; 8\n"
  , __filename = "lib/player/freq/_pal.asm";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append(";; Frequency table for PAL-B\n;;\nfreq_lo:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $17,$27,$39,$4b,$5f,$74,$8a,$a1,$ba,$d4,$f0,$0e  ; 1\n  .byte $2d,$4e,$71,$96,$be,$e8,$14,$43,$74,$a9,$e1,$1c  ; 2\n  .byte $5a,$9c,$e2,$2d,$7c,$cf,$28,$85,$e8,$52,$c1,$37  ; 3\n  .byte $b4,$39,$c5,$5a,$f7,$9e,$4f,$0a,$d1,$a3,$82,$6e  ; 4\n  .byte $68,$71,$8a,$b3,$ee,$3c,$9e,$15,$a2,$46,$04,$dc  ; 5\n  .byte $d0,$e2,$14,$67,$dd,$79,$3c,$29,$44,$8d,$08,$b8  ; 6\n  .byte $a1,$c5,$28,$cd,$ba,$f1,$78,$53,$87,$1a,$10,$71  ; 7\n  .byte $42,$89,$4f,$9b,$74,$e2,$f0,$a6,$0e,$33,$20,$ff  ; 8\n\nfreq_hi:\n;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B\n  .byte $01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$02  ; 1\n  .byte $02,$02,$02,$02,$02,$02,$03,$03,$03,$03,$03,$04  ; 2\n  .byte $04,$04,$04,$05,$05,$05,$06,$06,$06,$07,$07,$08  ; 3\n  .byte $08,$09,$09,$0a,$0a,$0b,$0c,$0d,$0d,$0e,$0f,$10  ; 4\n  .byte $11,$12,$13,$14,$15,$17,$18,$1a,$1b,$1d,$1f,$20  ; 5\n  .byte $22,$24,$27,$29,$2b,$2e,$31,$34,$37,$3a,$3e,$41  ; 6\n  .byte $45,$49,$4e,$52,$57,$5c,$62,$68,$6e,$75,$7c,$83  ; 7\n  .byte $8b,$93,$9c,$a5,$af,$b9,$c4,$d0,$dd,$ea,$f8,$ff  ; 8\n")
    ; __line = 24
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line);
}

};
return fn(data, null, include);
},
};

module.exports = function(data) {
var include = function include(includePath, includedData) {
  return templates[includePath](includedData);
};
var fn = function anonymous(locals, escape, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, filename, lineno){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escape = escape || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = ";;\n;; Header for a PSID v2NG file\n;; See http://cpansearch.perl.org/src/LALA/Audio-SID-3.11/SID_file_format.txt\n;;\n;; load address\nBASEADDR = $1000\n;; flags\n;; NOTE when using PAL or NTSC, set also SP_PAL or SP_NTSC in SPEED flag\nF_MISC = 2  ; built-in player\nF_PAL  = 4\nF_NTSC = 8\nF_MOS6581 = 16\nF_MOS8580 = 32\nFLAGS = F_MOS6581 | F_PAL | F_MISC\n;; speed flag\nC_PAL  = 0\nC_NTSC = 1\nCLOCK = C_PAL\n;;\n.aasc \"PSID\"              ; magicId\n.byte 0,2                 ; version\n.byte 0,$7c               ; dataOffset\n.byte >BASEADDR,<BASEADDR ; loadAddress (loadAddress == dataOffset)\n.byte >init,<init         ; initAddress\n.byte >play,<play         ; playAddress\n.byte 0,1                 ; songs\n.byte 0,1                 ; startSong\n.word 0,CLOCK             ; speed\n.aasc \"<%- headers.title %>\"\n.aasc \"<%- headers.author %>\"\n.aasc \"<%- headers.released %>\"\n.byte 0,FLAGS             ; flags (PAL 6581 only)\n.byte 0                   ; startPage\n.byte 0                   ; pageLength\n.byte 0,0                 ; (reserved)\n\n* = BASEADDR\n\n<%- include('_main.asm', { debug: debug, song: song, initialStates: initialStates, sequences: sequences }) %>\n"
  , __filename = "lib/player/sid.asm";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append(";;\n;; Header for a PSID v2NG file\n;; See http://cpansearch.perl.org/src/LALA/Audio-SID-3.11/SID_file_format.txt\n;;\n;; load address\nBASEADDR = $1000\n;; flags\n;; NOTE when using PAL or NTSC, set also SP_PAL or SP_NTSC in SPEED flag\nF_MISC = 2  ; built-in player\nF_PAL  = 4\nF_NTSC = 8\nF_MOS6581 = 16\nF_MOS8580 = 32\nFLAGS = F_MOS6581 | F_PAL | F_MISC\n;; speed flag\nC_PAL  = 0\nC_NTSC = 1\nCLOCK = C_PAL\n;;\n.aasc \"PSID\"              ; magicId\n.byte 0,2                 ; version\n.byte 0,$7c               ; dataOffset\n.byte >BASEADDR,<BASEADDR ; loadAddress (loadAddress == dataOffset)\n.byte >init,<init         ; initAddress\n.byte >play,<play         ; playAddress\n.byte 0,1                 ; songs\n.byte 0,1                 ; startSong\n.word 0,CLOCK             ; speed\n.aasc \"")
    ; __line = 29
    ; __append(headers.title)
    ; __append("\"\n.aasc \"")
    ; __line = 30
    ; __append(headers.author)
    ; __append("\"\n.aasc \"")
    ; __line = 31
    ; __append(headers.released)
    ; __append("\"\n.byte 0,FLAGS             ; flags (PAL 6581 only)\n.byte 0                   ; startPage\n.byte 0                   ; pageLength\n.byte 0,0                 ; (reserved)\n\n* = BASEADDR\n\n")
    ; __line = 39
    ; __append(include('_main.asm', { debug: debug, song: song, initialStates: initialStates, sequences: sequences }))
    ; __append("\n")
    ; __line = 40
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line);
}

};
return fn(data, null, include);
}
;