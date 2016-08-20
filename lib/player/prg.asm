.word $0801
* = $0801

; autostart routine
.word $080b, 2015
.byte $9e, "2061", 0, 0, 0

main:
    sei

    ldy #$7f          ; $7f = %01111111
    sty $dc0d         ; turn off CIAs Timer interrupts ($7f = %01111111)
    sty $dd0d
    lda $dc0d         ; by reading $dc0d and $dd0d we cancel all CIA-IRQs
    lda $dd0d         ; in queue/unprocessed.

    lda #$01          ; set Interrupt Request Mask
    sta $d01a         ; we want IRQ by Rasterbeam (%00000001)

    lda #<irq         ; point IRQ Vector to our custom irq routine
    ldx #>irq
    sta $0314         ; store in $314/$315
    stx $0315

    lda #$10          ; trigger interrupt at row $10
    sta $d012

    lda #0
    sta $d011
    sta $d020
    sta $d021

    jsr init

    cli
    jmp *

irq:
    dec $d019       ; acknowledge IRQ / clear register for next interrupt

    inc $d020
    jsr play
    dec $d020

    jmp $ea31       ; return to Kernel routine

.res $1000 - *

<%- include('_main.asm', {
  debug: locals.debug,
  song: locals.song,
  initialStates: locals.initialStates,
  sequences: locals.sequences
}) %>
