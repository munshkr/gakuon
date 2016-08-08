#!/usr/bin/env python3
import sys
import json

def main():
    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, 'r') as inf:
        d = json.load(inf)
        sd = ((k, d[k]) for k in sorted(d, key=d.get))

        with open(output_file, 'w') as outf:
            breaks = []

            for label, addr in sd:
                if '__break__' in label:
                    breaks.append(addr)
                outf.write("al %x .%s\n" % (addr, label))

            for addr in breaks:
                outf.write("break %x\n" % (addr))


if __name__ == "__main__":
    main()
