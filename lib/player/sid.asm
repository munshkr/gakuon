;;
;; Header for a PSID v2NG file
;; See http://cpansearch.perl.org/src/LALA/Audio-SID-3.11/SID_file_format.txt
;;
;; load address
BASEADDR = $1000
;; flags
;; NOTE when using PAL or NTSC, set also SP_PAL or SP_NTSC in SPEED flag
F_MISC = 2  ; built-in player
F_PAL  = 4
F_NTSC = 8
F_MOS6581 = 16
F_MOS8580 = 32
FLAGS = F_MOS6581 | F_PAL | F_MISC
;; speed flag
C_PAL  = 0
C_NTSC = 1
CLOCK = C_PAL
;;
.aasc "PSID"              ; magicId
.byte 0,2                 ; version
.byte 0,$7c               ; dataOffset
.byte 0,0                 ; loadAddress (0 means that load addr is at 0x7c)
.byte >init,<init         ; initAddress
.byte >play,<play         ; playAddress
.byte 0,1                 ; songs
.byte 0,1                 ; startSong
.word 0,CLOCK             ; speed
.aasc "<%- locals.headers.title %>"
.aasc "<%- locals.headers.author %>"
.aasc "<%- locals.headers.released %>"
.byte 0,FLAGS             ; flags (PAL 6581 only)
.byte 0                   ; startPage
.byte 0                   ; pageLength
.byte 0,0                 ; (reserved)

.word BASEADDR
* = BASEADDR

<%- include('_main.asm', {
  debug: locals.debug,
  song: locals.song,
  initialStates: locals.initialStates,
  sequences: locals.sequences
}) %>
