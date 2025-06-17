=== function style(tag, text) ===
~ return "<" + tag + ">" + text + "</" + tag + ">"

=== function sep() ===
~ return "</hr>"

=== function set_mc_gender(gender) ===
{
    - gender == "female":
      ~ mc_gender = "female"
      ~ mc_man = "woman"
      ~ mc_Man = "Woman"
      ~ mc_guy = "girl"
      ~ mc_Guy = "Girl"
      ~ mc_boy = "girl"
      ~ mc_Boy = "Girl"
      ~ mc_son = "daughter"
      ~ mc_brother = "sister"
      ~ mc_Brother = "Sister"
      ~ mc_papa = "mama"
      ~ mc_Papa = "Mama"
      ~ mc_father = "mother"
      ~ mc_Father = "Mother"
      ~ mc_he = "she"
      ~ mc_He = "She"
      ~ mc_his = "her"
      ~ mc_His = "Her"
      ~ mc_hiss = "hers"
      ~ mc_Hiss = "Hers"
      ~ mc_him = "her"
      ~ mc_Him = "Her"
}
