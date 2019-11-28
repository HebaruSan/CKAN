using System;
using System.IO;
using System.Drawing;
using Newtonsoft.Json;

namespace CKAN
{
    [JsonObject(MemberSerialization.OptIn)]
    public class ModuleLabelList
    {
        [JsonProperty("labels", NullValueHandling = NullValueHandling.Ignore)]
        public ModuleLabel[] Labels = new ModuleLabel[] {};

        public static readonly string DefaultPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "CKAN",
            "labels.json"
        );

        public static ModuleLabelList GetDefaultLabels()
        {
            return new ModuleLabelList() {
                Labels = new ModuleLabel[] {
                    new ModuleLabel() {
                        Name  = Properties.Resources.ModuleLabelListFavourites,
                        Color = Color.PaleGreen,
                    },
                    new ModuleLabel() {
                        Name  = Properties.Resources.ModuleLabelListHidden,
                        Hide  = true,
                        Color = Color.PaleVioletRed,
                    },
                }
            };
        }

        public string[] LabelsMatchingModule(string identifier)
        {
            return new string[] {};
        }

        public static ModuleLabelList Load(string path)
        {
            try
            {
                return JsonConvert.DeserializeObject<ModuleLabelList>(File.ReadAllText(path));
            }
            catch (FileNotFoundException ex)
            {
                return null;
            }
        }

        public bool Save(string path)
        {
            try
            {
                File.WriteAllText(path, JsonConvert.SerializeObject(this, Formatting.Indented));
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}