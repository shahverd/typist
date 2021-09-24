lines = {}
with open('first_850_words_list.txt', 'r') as reader:
    lines = reader.readlines()

for i in range(0,41):
    lines_of_file = []

    for j in range(0,50):
        lines_of_file.append(lines[i*20 + j].replace("\n", ""))

    with open("from_" + str(i*20) + '.txt', 'w') as writer:
        writer.write(" ".join(lines_of_file))
